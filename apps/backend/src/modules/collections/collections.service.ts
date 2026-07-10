import { Injectable } from "@nestjs/common";
import { MonthlyFeeStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

type CollectionFilters = {
  search?: string;
  status?: string;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
};

const validStatuses = new Set<string>(Object.values(MonthlyFeeStatus));

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: CollectionFilters) {
    const status = filters.status && validStatuses.has(filters.status) ? (filters.status as MonthlyFeeStatus) : undefined;
    const search = filters.search?.trim();
    const period = filters.period?.trim();
    const dateFrom = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00.000Z`) : undefined;
    const dateTo = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999Z`) : undefined;

    const where: Prisma.MonthlyFeeWhereInput = {
      ...(status ? { status } : { status: { in: [MonthlyFeeStatus.PENDING, MonthlyFeeStatus.PARTIAL, MonthlyFeeStatus.PAID] } }),
      ...(period ? { period } : {}),
      ...(dateFrom || dateTo
        ? {
            OR: [
              { dueDate: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } },
              { dueDate: null, createdAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            ]
          }
        : {}),
      ...(search
        ? {
            service: {
              customer: {
                OR: [
                  { fullName: { contains: search, mode: "insensitive" } },
                  { documentNumber: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } }
                ]
              }
            }
          }
        : {})
    };

    const fees = await this.prisma.monthlyFee.findMany({
      where,
      include: {
        payments: { orderBy: { paidAt: "desc" } },
        service: { include: { customer: true, plan: true } }
      },
      orderBy: [{ period: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      take: 300
    });

    const now = new Date();
    const pendingFees = fees.filter((fee) => fee.status !== MonthlyFeeStatus.PAID && fee.status !== MonthlyFeeStatus.VOID);
    const paidThisMonth = fees
      .flatMap((fee) => fee.payments)
      .filter((payment) => payment.status === "VALID" && payment.paidAt.getFullYear() === now.getFullYear() && payment.paidAt.getMonth() === now.getMonth())
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const data = fees.map((fee) => this.toCollectionItem(fee));

    return {
      success: true,
      data: {
        summary: {
          totalPending: pendingFees.reduce((sum, fee) => sum + Number(fee.balance), 0),
          pendingCount: pendingFees.length,
          overdueCount: pendingFees.filter((fee) => fee.dueDate && fee.dueDate < now).length,
          partialCount: fees.filter((fee) => fee.status === MonthlyFeeStatus.PARTIAL).length,
          paidThisMonth
        },
        items: data
      }
    };
  }

  private toCollectionItem(
    fee: Prisma.MonthlyFeeGetPayload<{
      include: { payments: true; service: { include: { customer: true; plan: true } } };
    }>
  ) {
    const customer = fee.service.customer;
    const plan = fee.service.plan;
    const validPayments = fee.payments.filter((payment) => payment.status === "VALID");
    return {
      id: fee.id,
      period: fee.period,
      dueDate: fee.dueDate,
      amount: Number(fee.amount),
      paidAmount: Number(fee.paidAmount),
      balance: Number(fee.balance),
      status: fee.status,
      notes: fee.notes,
      lastPaymentAt: validPayments[0]?.paidAt ?? null,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        documentNumber: customer.documentNumber,
        phone: customer.phone,
        address: customer.address,
        district: customer.district,
        status: customer.status
      },
      service: {
        id: fee.service.id,
        status: fee.service.status,
        screenCount: fee.service.screenCount,
        plan: {
          id: plan.id,
          type: plan.type,
          name: plan.name,
          monthlyPrice: Number(plan.monthlyPrice),
          downloadMbps: plan.downloadMbps,
          uploadMbps: plan.uploadMbps,
          maxScreens: plan.maxScreens
        }
      }
    };
  }
}

