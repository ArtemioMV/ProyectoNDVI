import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CustomerServiceStatus, CustomerStatus, MonthlyFeeStatus, PlanType, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreateCustomerDto, CreateCustomerServiceDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { currentBillingCycle, cycleDays, cyclePeriodKey, daysUsedInCycle } from "../../shared/billing-cycle";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const normalizedSearch = search?.trim();
    const customers = await this.prisma.customer.findMany({
      where: normalizedSearch
        ? {
            OR: [
              { fullName: { contains: normalizedSearch, mode: "insensitive" } },
              { documentNumber: { contains: normalizedSearch } },
              { phone: { contains: normalizedSearch } }
            ]
          }
        : undefined,
      include: {
        services: {
          include: { plan: true },
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      data: customers.map((customer) => this.toResponse(customer))
    };
  }

  async create(dto: CreateCustomerDto) {
    const planIds = dto.services.map((service) => service.planId);
    const plans = await this.prisma.servicePlan.findMany({
      where: { id: { in: planIds }, isActive: true }
    });
    const plansById = new Map(plans.map((plan) => [plan.id, plan]));

    const selectedTypes = new Set<PlanType>();
    for (const service of dto.services) {
      const plan = plansById.get(service.planId);
      if (!plan) {
        throw new BadRequestException("Uno de los planes seleccionados no existe o esta inactivo");
      }
      if (selectedTypes.has(plan.type)) {
        throw new BadRequestException("Solo se permite un plan activo por tipo de servicio");
      }
      selectedTypes.add(plan.type);
      if (plan.type === PlanType.TV && !service.screenCount) {
        throw new BadRequestException("Los planes de TV requieren cantidad de pantallas");
      }
    }

    try {
      const customer = await this.prisma.customer.create({
        data: {
          documentType: dto.documentType?.trim() || "DNI",
          documentNumber: dto.documentNumber.trim(),
          fullName: dto.fullName.trim(),
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          signupDate: dto.signupDate ? new Date(dto.signupDate) : null,
          phone: dto.phone?.trim() || null,
          email: dto.email?.trim() || null,
          country: dto.country?.trim() || "PE",
          department: dto.department?.trim() || null,
          province: dto.province?.trim() || null,
          address: dto.address?.trim() || null,
          district: dto.district?.trim() || null,
          reference: dto.reference?.trim() || null,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          identityNotes: dto.identityNotes?.trim() || null,
          photoUrl: dto.photoUrl?.trim() || null,
          leadSource: dto.leadSource?.trim() || null,
          services: {
            create: dto.services.map((service) => ({
              planId: service.planId,
              screenCount: service.screenCount ?? null,
              notes: service.notes?.trim() || null
            }))
          }
        },
        include: {
          services: {
            include: { plan: true },
            orderBy: { createdAt: "desc" }
          }
        }
      });

      return {
        success: true,
        data: this.toResponse(customer),
        message: "Cliente creado"
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un cliente con ese DNI/documento");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Cliente no encontrado");

    const data: Prisma.CustomerUpdateInput = {};
    if (dto.documentType !== undefined) data.documentType = dto.documentType?.trim() || "DNI";
    if (dto.documentNumber !== undefined) data.documentNumber = dto.documentNumber.trim();
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.birthDate !== undefined) data.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.signupDate !== undefined) data.signupDate = dto.signupDate ? new Date(dto.signupDate) : null;
    if (dto.phone !== undefined) data.phone = dto.phone?.trim() || null;
    if (dto.email !== undefined) data.email = dto.email?.trim() || null;
    if (dto.country !== undefined) data.country = dto.country?.trim() || "PE";
    if (dto.department !== undefined) data.department = dto.department?.trim() || null;
    if (dto.province !== undefined) data.province = dto.province?.trim() || null;
    if (dto.address !== undefined) data.address = dto.address?.trim() || null;
    if (dto.district !== undefined) data.district = dto.district?.trim() || null;
    if (dto.reference !== undefined) data.reference = dto.reference?.trim() || null;
    if (dto.latitude !== undefined) data.latitude = dto.latitude ?? null;
    if (dto.longitude !== undefined) data.longitude = dto.longitude ?? null;
    if (dto.identityNotes !== undefined) data.identityNotes = dto.identityNotes?.trim() || null;
    if (dto.photoUrl !== undefined) data.photoUrl = dto.photoUrl?.trim() || null;
    if (dto.leadSource !== undefined) data.leadSource = dto.leadSource?.trim() || null;

    try {
      const customer = await this.prisma.customer.update({
        where: { id },
        data,
        include: { services: { include: { plan: true } } }
      });
      return { success: true, data: this.toResponse(customer), message: "Cliente actualizado" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un cliente con ese documento");
      }
      throw error;
    }
  }

  /**
   * Cambia el estado del cliente y aplica cascada operativa a sus servicios:
   * suspender detiene los activos, reactivar levanta los suspendidos y
   * cancelar cierra todo. La facturacion usa el estado del servicio.
   */
  async changeStatus(id: string, status: CustomerStatus) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Cliente no encontrado");

    const now = new Date();
    const customer = await this.prisma.$transaction(async (tx) => {
      if (status === CustomerStatus.SUSPENDED) {
        const affected = await tx.customerService.findMany({
          where: { customerId: id, status: CustomerServiceStatus.ACTIVE },
          include: { plan: true }
        });
        for (const service of affected) {
          await this.prorateCurrentCycleFee(tx, service, now);
        }
        await tx.customerService.updateMany({
          where: { customerId: id, status: CustomerServiceStatus.ACTIVE },
          data: { status: CustomerServiceStatus.SUSPENDED }
        });
      } else if (status === CustomerStatus.CANCELLED) {
        const affected = await tx.customerService.findMany({
          where: { customerId: id, status: { not: CustomerServiceStatus.CANCELLED } },
          include: { plan: true }
        });
        for (const service of affected) {
          await this.prorateCurrentCycleFee(tx, service, now);
        }
        await tx.customerService.updateMany({
          where: { customerId: id, status: { not: CustomerServiceStatus.CANCELLED } },
          data: { status: CustomerServiceStatus.CANCELLED }
        });
      } else if (status === CustomerStatus.ACTIVE) {
        const reactivated = await tx.customerService.findMany({
          where: { customerId: id, status: CustomerServiceStatus.SUSPENDED },
          include: { plan: true }
        });
        await tx.customerService.updateMany({
          where: { customerId: id, status: CustomerServiceStatus.SUSPENDED },
          data: { status: CustomerServiceStatus.ACTIVE }
        });
        for (const service of reactivated) {
          await this.ensureCurrentCycleFee(tx, service, now);
        }
      }

      return tx.customer.update({
        where: { id },
        data: { status },
        include: { services: { include: { plan: true } } }
      });
    });

    return { success: true, data: this.toResponse(customer), message: "Estado del cliente actualizado" };
  }

  async changeServiceStatus(customerId: string, serviceId: string, status: CustomerServiceStatus) {
    const service = await this.prisma.customerService.findFirst({ where: { id: serviceId, customerId }, include: { plan: true } });
    if (!service) throw new NotFoundException("Servicio del cliente no encontrado");

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      if (
        service.status === CustomerServiceStatus.ACTIVE &&
        (status === CustomerServiceStatus.SUSPENDED || status === CustomerServiceStatus.CANCELLED)
      ) {
        await this.prorateCurrentCycleFee(tx, service, now);
      }

      // El ciclo de facturacion se ancla a la activacion (docs/business-rules/monthly-billing.md).
      const installedAt = status === CustomerServiceStatus.ACTIVE && !service.installedAt ? now : service.installedAt;
      await tx.customerService.update({ where: { id: serviceId }, data: { status, installedAt } });

      if (status === CustomerServiceStatus.ACTIVE) {
        await this.ensureCurrentCycleFee(tx, { ...service, installedAt }, now);
      }
    });

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { services: { include: { plan: true } } }
    });
    return { success: true, data: this.toResponse(customer!), message: "Estado del servicio actualizado" };
  }

  /**
   * Agrega un servicio a un cliente existente. Regla de negocio: un solo
   * servicio no-cancelado por tipo (Internet/TV) por cliente.
   */
  async addService(customerId: string, dto: CreateCustomerServiceDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { services: { include: { plan: true } } }
    });
    if (!customer) throw new NotFoundException("Cliente no encontrado");

    const plan = await this.prisma.servicePlan.findFirst({ where: { id: dto.planId, isActive: true } });
    if (!plan) throw new BadRequestException("El plan seleccionado no existe o esta inactivo");
    if (plan.type === PlanType.TV && !dto.screenCount) {
      throw new BadRequestException("Los planes de TV requieren cantidad de pantallas");
    }

    const sameTypeActive = customer.services.find(
      (service) => service.plan.type === plan.type && service.status !== CustomerServiceStatus.CANCELLED
    );
    if (sameTypeActive) {
      throw new ConflictException(
        `El cliente ya tiene un servicio de ${plan.type === PlanType.TV ? "IPTV" : "internet"} vigente; suspendelo o cancelalo primero`
      );
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const created = await tx.customerService.create({
        data: {
          customerId,
          planId: plan.id,
          screenCount: plan.type === PlanType.TV ? dto.screenCount ?? plan.maxScreens ?? 1 : null,
          notes: dto.notes?.trim() || null,
          status: CustomerServiceStatus.ACTIVE,
          installedAt: now
        }
      });
      await this.ensureCurrentCycleFee(tx, { ...created, plan }, now);
    });

    const updated = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { services: { include: { plan: true } } }
    });
    return { success: true, data: this.toResponse(updated!), message: "Servicio agregado" };
  }

  /**
   * Prorratea la mensualidad del ciclo en curso al cortar (suspender/cancelar):
   * monto = precioMensual * diasUsados / diasDelCiclo (monthly-billing.md).
   * No baja el monto por debajo de lo ya pagado ni toca cuotas PAGADAS/ANULADAS.
   */
  private async prorateCurrentCycleFee(
    tx: Prisma.TransactionClient,
    service: { id: string; installedAt: Date | null; createdAt: Date; plan: { monthlyPrice: Prisma.Decimal } },
    cutDate: Date
  ) {
    const installedAt = service.installedAt ?? service.createdAt;
    const cycle = currentBillingCycle(installedAt, cutDate);
    const period = cyclePeriodKey(cycle.start);
    const fee = await tx.monthlyFee.findUnique({ where: { serviceId_period: { serviceId: service.id, period } } });
    if (!fee || fee.status === MonthlyFeeStatus.VOID || fee.status === MonthlyFeeStatus.PAID) return;

    const totalDays = cycleDays(cycle);
    const usedDays = daysUsedInCycle(cycle, cutDate);
    if (usedDays >= totalDays) return;

    let amount = new Prisma.Decimal(service.plan.monthlyPrice).mul(usedDays).div(totalDays).toDecimalPlaces(2);
    if (amount.lt(fee.paidAmount)) amount = fee.paidAmount;
    const balance = amount.sub(fee.paidAmount);
    const status = balance.lte(0)
      ? MonthlyFeeStatus.PAID
      : fee.paidAmount.gt(0)
        ? MonthlyFeeStatus.PARTIAL
        : MonthlyFeeStatus.PENDING;

    await tx.monthlyFee.update({
      where: { id: fee.id },
      data: {
        amount,
        balance,
        status,
        notes: `${fee.notes ? `${fee.notes} · ` : ""}Prorrateado: ${usedDays}/${totalDays} dias`
      }
    });
  }

  /** Al activar un servicio crea (si falta) la mensualidad del ciclo vigente. */
  private async ensureCurrentCycleFee(
    tx: Prisma.TransactionClient,
    service: { id: string; installedAt: Date | null; plan: { monthlyPrice: Prisma.Decimal } },
    now: Date
  ) {
    const installedAt = service.installedAt ?? now;
    const cycle = currentBillingCycle(installedAt, now);
    const period = cyclePeriodKey(cycle.start);
    await tx.monthlyFee.upsert({
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
      }
    });
  }

  private toResponse(
    customer: Prisma.CustomerGetPayload<{ include: { services: { include: { plan: true } } } }>
  ) {
    return {
      ...customer,
      services: customer.services.map((service) => ({
        ...service,
        plan: {
          ...service.plan,
          monthlyPrice: Number(service.plan.monthlyPrice)
        }
      }))
    };
  }
}


