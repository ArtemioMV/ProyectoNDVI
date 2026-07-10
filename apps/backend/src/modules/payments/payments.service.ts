import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CashMovementSource, CashMovementType, CashRegisterStatus, MonthlyFeeStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GenerateMonthlyFeesDto } from "./dto/generate-monthly-fees.dto";
import { RegisterPaymentDto } from "./dto/register-payment.dto";
import { VoidPaymentDto } from "./dto/void-payment.dto";
import { formatPaymentReceiptCode } from "../../shared/receipt-code";
import { currentBillingCycle } from "../../shared/billing-cycle";
import type { AuthenticatedUser } from "../../common/auth/types";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerPaymentHistory(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        services: {
          include: {
            plan: true,
            monthlyFees: {
              include: { payments: { include: { evidences: true, user: true }, orderBy: { paidAt: "desc" } } },
              orderBy: { period: "desc" }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException("El cliente no existe");
    }

    const fees = customer.services.flatMap((service) =>
      service.monthlyFees.map((fee) => ({
        ...this.toMonthlyFeeResponse(fee),
        service: {
          id: service.id,
          status: service.status,
          screenCount: service.screenCount,
          plan: this.toPlanResponse(service.plan)
        }
      }))
    );

    const totalDebt = fees.reduce((sum, fee) => sum + fee.balance, 0);

    return {
      success: true,
      data: {
        customer: this.toCustomerSummary(customer),
        totalDebt,
        fees
      }
    };
  }

  async generateMonthlyFees(customerId: string, dto: GenerateMonthlyFeesDto) {
    const services = await this.prisma.customerService.findMany({
      where: { customerId, status: "ACTIVE" },
      include: { plan: true }
    });

    if (services.length === 0) {
      throw new BadRequestException("El cliente no tiene servicios activos para generar mensualidades");
    }

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    const fees = await this.prisma.$transaction(
      services.map((service) => {
        const amount = service.plan.monthlyPrice;
        return this.prisma.monthlyFee.upsert({
          where: { serviceId_period: { serviceId: service.id, period: dto.period } },
          update: {},
          create: {
            serviceId: service.id,
            period: dto.period,
            dueDate,
            amount,
            paidAmount: new Prisma.Decimal(0),
            balance: amount,
            notes: dto.notes?.trim() || null
          },
          include: { payments: true }
        });
      })
    );

    return {
      success: true,
      data: fees.map((fee) => this.toMonthlyFeeResponse(fee)),
      message: "Mensualidades generadas"
    };
  }


  async generateAutomaticMonthlyFees() {
    const now = new Date();
    const services = await this.prisma.customerService.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true }
    });

    const created = [];
    for (const service of services) {
      const installedAt = service.installedAt ?? service.createdAt;
      if (installedAt > now) continue;

      const cycle = currentBillingCycle(installedAt, now);
      const period = cycle.start.toISOString().slice(0, 10);
      const fee = await this.prisma.monthlyFee.upsert({
        where: { serviceId_period: { serviceId: service.id, period } },
        update: {},
        create: {
          serviceId: service.id,
          period,
          dueDate: cycle.end,
          amount: service.plan.monthlyPrice,
          paidAmount: new Prisma.Decimal(0),
          balance: service.plan.monthlyPrice,
          notes: `Ciclo ${period} a ${cycle.end.toISOString().slice(0, 10)}`
        },
        include: { payments: true }
      });
      created.push(this.toMonthlyFeeResponse(fee));
    }

    return { success: true, data: created, message: "Mensualidades automaticas generadas" };
  }
  async registerPayment(dto: RegisterPaymentDto, user?: AuthenticatedUser) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const fee = await tx.monthlyFee.findUnique({
        where: { id: dto.monthlyFeeId },
        include: { payments: { where: { status: PaymentStatus.VALID } } }
      });

      if (!fee) {
        throw new NotFoundException("La mensualidad no existe");
      }
      if (fee.status === MonthlyFeeStatus.VOID) {
        throw new BadRequestException("No se puede pagar una mensualidad anulada");
      }
      if (fee.balance.lte(0)) {
        throw new BadRequestException("La mensualidad ya esta pagada");
      }

      const amount = new Prisma.Decimal(dto.amount);
      const methodSetting = await tx.paymentMethodSetting.findUnique({ where: { method: dto.method } });
      if (methodSetting && !methodSetting.isActive) {
        throw new BadRequestException("El metodo de pago esta desactivado");
      }
      if (methodSetting?.requiresEvidence && (!dto.evidences || dto.evidences.length === 0)) {
        throw new BadRequestException("Este metodo de pago requiere evidencia");
      }
      if (dto.method === PaymentMethod.CASH && dto.evidences?.length) {
        throw new BadRequestException("El efectivo no requiere evidencia");
      }
      if (amount.gt(fee.balance)) {
        throw new BadRequestException("El pago supera el saldo pendiente");
      }

      const openCashRegister = await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
      if (!openCashRegister) {
        throw new BadRequestException("Debe abrir caja antes de registrar pagos");
      }

      const receiptCode = await this.nextReceiptCode(tx);
      const created = await tx.payment.create({
        data: {
          monthlyFeeId: fee.id,
          amount,
          method: dto.method,
          userId: user?.id,
          receiptCode,
          notes: dto.notes?.trim() || null
        }
      });

      if (dto.evidences?.length) {
        await tx.paymentEvidence.createMany({
          data: dto.evidences.map((evidence) => ({
            paymentId: created.id,
            fileName: evidence.fileName.trim(),
            url: evidence.url.trim(),
            mimeType: evidence.mimeType?.trim() || null,
            sizeBytes: evidence.sizeBytes ?? null
          }))
        });
      }

      await tx.cashMovement.create({
        data: {
          cashRegisterId: openCashRegister.id,
          type: CashMovementType.INCOME,
          source: CashMovementSource.PAYMENT,
          referenceId: created.id,
          userId: user?.id,
          amount,
          description: `Pago ${receiptCode}`
        }
      });
      await tx.cashRegister.update({
        where: { id: openCashRegister.id },
        data: { expectedAmount: { increment: amount } }
      });

      const paidAmount = fee.paidAmount.add(amount);
      const balance = fee.amount.sub(paidAmount);
      await tx.monthlyFee.update({
        where: { id: fee.id },
        data: {
          paidAmount,
          balance,
          status: balance.lte(0) ? MonthlyFeeStatus.PAID : MonthlyFeeStatus.PARTIAL
        }
      });

      return created;
    });

    return {
      success: true,
      data: await this.getPaymentTicketData(payment.id),
      message: "Pago registrado"
    };
  }

  async voidPayment(paymentId: string, dto: VoidPaymentDto, user?: AuthenticatedUser) {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { monthlyFee: true }
      });

      if (!payment) {
        throw new NotFoundException("El pago no existe");
      }
      if (payment.status === PaymentStatus.VOID) {
        throw new BadRequestException("El pago ya esta anulado");
      }

      const openCashRegister = await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
      if (!openCashRegister) {
        throw new BadRequestException("Debe abrir caja antes de anular pagos");
      }

      const reason = dto.reason?.trim();
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.VOID,
          notes: [payment.notes, reason ? `Anulado: ${reason}` : "Anulado"].filter(Boolean).join(" | ")
        }
      });

      const recalculatedPaidAmount = payment.monthlyFee.paidAmount.sub(payment.amount);
      const paidAmount = recalculatedPaidAmount.lt(0) ? new Prisma.Decimal(0) : recalculatedPaidAmount;
      const balance = payment.monthlyFee.amount.sub(paidAmount);
      await tx.monthlyFee.update({
        where: { id: payment.monthlyFeeId },
        data: {
          paidAmount,
          balance,
          status: paidAmount.lte(0) ? MonthlyFeeStatus.PENDING : balance.lte(0) ? MonthlyFeeStatus.PAID : MonthlyFeeStatus.PARTIAL
        }
      });

      await tx.cashMovement.create({
        data: {
          cashRegisterId: openCashRegister.id,
          type: CashMovementType.EXPENSE,
          source: CashMovementSource.PAYMENT,
          referenceId: payment.id,
          userId: user?.id,
          amount: payment.amount,
          description: `Anulacion ${payment.receiptCode}`
        }
      });
      await tx.cashRegister.update({
        where: { id: openCashRegister.id },
        data: { expectedAmount: { decrement: payment.amount } }
      });
    });

    return {
      success: true,
      data: await this.getPaymentTicketData(paymentId),
      message: "Pago anulado"
    };
  }

  async getPaymentTicket(paymentId: string) {
    return {
      success: true,
      data: await this.getPaymentTicketData(paymentId)
    };
  }

  async getCustomerContract(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { services: { include: { plan: true }, orderBy: { createdAt: "asc" } } }
    });

    if (!customer) {
      throw new NotFoundException("El cliente no existe");
    }

    const activeServices = customer.services.filter((service) => service.status === "ACTIVE");
    const monthlyTotal = activeServices.reduce((sum, service) => sum + Number(service.plan.monthlyPrice), 0);

    return {
      success: true,
      data: {
        contractCode: `CON-${customer.documentNumber}-${new Date().getFullYear()}`,
        generatedAt: new Date().toISOString(),
        customer: this.toCustomerSummary(customer),
        services: activeServices.map((service) => ({
          id: service.id,
          screenCount: service.screenCount,
          installedAt: service.installedAt,
          plan: this.toPlanResponse(service.plan)
        })),
        monthlyTotal,
        clauses: [
          "El cliente declara conocer el plan contratado y su tarifa mensual.",
          "El pago mensual se realiza segun el periodo generado por el sistema.",
          "La empresa puede suspender el servicio por deuda pendiente.",
          "Los equipos o materiales entregados deben ser conservados en buen estado."
        ]
      }
    };
  }


  private async getPaymentTicketData(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        evidences: true,
        user: true,
        monthlyFee: {
          include: {
            service: {
              include: { customer: true, plan: true }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException("El pago no existe");
    }

    return {
      id: payment.id,
      receiptCode: payment.receiptCode,
      paidAt: payment.paidAt,
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status,
      notes: payment.notes,
      collectedBy: payment.user ? { id: payment.user.id, username: payment.user.username } : null,
      evidences: payment.evidences.map((evidence) => ({
        id: evidence.id,
        fileName: evidence.fileName,
        url: evidence.url,
        mimeType: evidence.mimeType,
        sizeBytes: evidence.sizeBytes,
        createdAt: evidence.createdAt
      })),
      monthlyFee: this.toMonthlyFeeResponse({ ...payment.monthlyFee, payments: [] }),
      customer: this.toCustomerSummary(payment.monthlyFee.service.customer),
      service: {
        id: payment.monthlyFee.service.id,
        plan: this.toPlanResponse(payment.monthlyFee.service.plan)
      }
    };
  }

  private async nextReceiptCode(tx: Prisma.TransactionClient) {
    const count = await tx.payment.count();
    return formatPaymentReceiptCode(count + 1);
  }

  private toCustomerSummary(customer: { id: string; documentNumber: string; fullName: string; phone: string | null; address: string | null; district: string | null }) {
    return {
      id: customer.id,
      documentNumber: customer.documentNumber,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      district: customer.district
    };
  }

  private toPlanResponse(plan: { id: string; type: string; name: string; monthlyPrice: Prisma.Decimal; downloadMbps: number | null; uploadMbps: number | null; maxScreens: number | null }) {
    return {
      ...plan,
      monthlyPrice: Number(plan.monthlyPrice)
    };
  }

  private toMonthlyFeeResponse(
    fee: { id: string; period: string; dueDate: Date | null; amount: Prisma.Decimal; paidAmount: Prisma.Decimal; balance: Prisma.Decimal; status: MonthlyFeeStatus; notes: string | null; payments: Array<{ id: string; amount: Prisma.Decimal; method: string; status: PaymentStatus; receiptCode: string; notes: string | null; paidAt: Date; user?: { id: string; username: string } | null; evidences?: Array<{ id: string; fileName: string; url: string; mimeType: string | null; sizeBytes: number | null; createdAt: Date }> }> }
  ) {
    return {
      id: fee.id,
      period: fee.period,
      dueDate: fee.dueDate,
      amount: Number(fee.amount),
      paidAmount: Number(fee.paidAmount),
      balance: Number(fee.balance),
      status: fee.status,
      notes: fee.notes,
      payments: fee.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
        collectedBy: payment.user ? { id: payment.user.id, username: payment.user.username } : null,
        evidences: (payment.evidences ?? []).map((evidence) => ({
          id: evidence.id,
          fileName: evidence.fileName,
          url: evidence.url,
          mimeType: evidence.mimeType,
          sizeBytes: evidence.sizeBytes,
          createdAt: evidence.createdAt
        }))
      }))
    };
  }
}







