import { BadRequestException, Injectable } from "@nestjs/common";
import { MonthlyFeeStatus, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

/**
 * Reportes financieros y operativos. Agregaciones en memoria: el volumen de un
 * ISP local (cientos de clientes) no justifica SQL crudo todavia.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(fromInput?: string, toInput?: string) {
    const now = new Date();
    const from = fromInput ? new Date(`${fromInput}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = toInput ? new Date(`${toInput}T23:59:59.999`) : now;
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      throw new BadRequestException("Rango de fechas invalido");
    }

    const [payments, sales, purchases, expenses, pendingFees, customers] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.VALID, paidAt: { gte: from, lte: to } },
        select: { amount: true, method: true, paidAt: true }
      }),
      this.prisma.materialSale.aggregate({
        where: { status: "VALID", createdAt: { gte: from, lte: to } },
        _sum: { totalAmount: true },
        _count: true
      }),
      this.prisma.materialPurchase.aggregate({
        where: { status: "REGISTERED", purchasedAt: { gte: from, lte: to } },
        _sum: { totalAmount: true },
        _count: true
      }),
      this.prisma.expense.aggregate({
        where: { status: "VALID", expenseDate: { gte: from, lte: to } },
        _sum: { amount: true },
        _count: true
      }),
      this.prisma.monthlyFee.findMany({
        where: { status: { in: [MonthlyFeeStatus.PENDING, MonthlyFeeStatus.PARTIAL] }, balance: { gt: 0 } },
        include: { service: { include: { customer: true, plan: true } } }
      }),
      this.prisma.customer.groupBy({ by: ["status"], _count: true })
    ]);

    const collected = payments.reduce((sum, payment) => sum.add(payment.amount), new Prisma.Decimal(0));
    const byMethod = new Map<string, Prisma.Decimal>();
    for (const payment of payments) {
      byMethod.set(payment.method, (byMethod.get(payment.method) ?? new Prisma.Decimal(0)).add(payment.amount));
    }

    const salesTotal = new Prisma.Decimal(sales._sum.totalAmount ?? 0);
    const purchasesTotal = new Prisma.Decimal(purchases._sum.totalAmount ?? 0);
    const expensesTotal = new Prisma.Decimal(expenses._sum.amount ?? 0);
    const net = collected.add(salesTotal).sub(purchasesTotal).sub(expensesTotal);

    const debtTotal = pendingFees.reduce((sum, fee) => sum.add(fee.balance), new Prisma.Decimal(0));
    const overdueFees = pendingFees.filter((fee) => fee.dueDate && fee.dueDate < now);

    const debtors = new Map<string, { customerId: string; fullName: string; documentNumber: string; phone: string | null; debt: Prisma.Decimal; overdue: boolean }>();
    for (const fee of pendingFees) {
      const customer = fee.service.customer;
      const entry = debtors.get(customer.id) ?? {
        customerId: customer.id,
        fullName: customer.fullName,
        documentNumber: customer.documentNumber,
        phone: customer.phone,
        debt: new Prisma.Decimal(0),
        overdue: false
      };
      entry.debt = entry.debt.add(fee.balance);
      if (fee.dueDate && fee.dueDate < now) entry.overdue = true;
      debtors.set(customer.id, entry);
    }
    const topDebtors = Array.from(debtors.values())
      .sort((a, b) => b.debt.comparedTo(a.debt))
      .slice(0, 8)
      .map((entry) => ({ ...entry, debt: Number(entry.debt) }));

    const customersByStatus = Object.fromEntries(customers.map((group) => [group.status, group._count]));

    return {
      success: true,
      data: {
        range: { from: from.toISOString(), to: to.toISOString() },
        collected: Number(collected),
        collectedByMethod: Array.from(byMethod.entries()).map(([method, amount]) => ({ method, amount: Number(amount) })),
        paymentsCount: payments.length,
        salesTotal: Number(salesTotal),
        salesCount: sales._count,
        purchasesTotal: Number(purchasesTotal),
        purchasesCount: purchases._count,
        expensesTotal: Number(expensesTotal),
        expensesCount: expenses._count,
        net: Number(net),
        debtTotal: Number(debtTotal),
        debtorsCount: debtors.size,
        overdueCount: overdueFees.length,
        topDebtors,
        customersByStatus
      }
    };
  }

  /** Serie de los ultimos N meses: cobrado vs gastos+compras (flujo operativo). */
  async getMonthlySeries(months = 6) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const [payments, expenses, purchases, sales] = await Promise.all([
      this.prisma.payment.findMany({ where: { status: PaymentStatus.VALID, paidAt: { gte: start } }, select: { amount: true, paidAt: true } }),
      this.prisma.expense.findMany({ where: { status: "VALID", expenseDate: { gte: start } }, select: { amount: true, expenseDate: true } }),
      this.prisma.materialPurchase.findMany({ where: { status: "REGISTERED", purchasedAt: { gte: start } }, select: { totalAmount: true, purchasedAt: true } }),
      this.prisma.materialSale.findMany({ where: { status: "VALID", createdAt: { gte: start } }, select: { totalAmount: true, createdAt: true } })
    ]);

    const keyOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const series: Array<{ month: string; income: number; outflow: number }> = [];
    for (let index = 0; index < months; index++) {
      const month = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
      series.push({ month: keyOf(month), income: 0, outflow: 0 });
    }
    const byMonth = new Map(series.map((item) => [item.month, item]));

    for (const payment of payments) byMonth.get(keyOf(payment.paidAt)) && (byMonth.get(keyOf(payment.paidAt))!.income += Number(payment.amount));
    for (const sale of sales) byMonth.get(keyOf(sale.createdAt)) && (byMonth.get(keyOf(sale.createdAt))!.income += Number(sale.totalAmount));
    for (const expense of expenses) byMonth.get(keyOf(expense.expenseDate)) && (byMonth.get(keyOf(expense.expenseDate))!.outflow += Number(expense.amount));
    for (const purchase of purchases) byMonth.get(keyOf(purchase.purchasedAt)) && (byMonth.get(keyOf(purchase.purchasedAt))!.outflow += Number(purchase.totalAmount));

    return { success: true, data: series };
  }

  /** Inventario valorizado y alertas de stock bajo. */
  async getInventoryReport() {
    const materials = await this.prisma.material.findMany({ where: { isActive: true } });
    let costValue = new Prisma.Decimal(0);
    let saleValue = new Prisma.Decimal(0);
    let units = 0;
    for (const material of materials) {
      units += material.stock;
      saleValue = saleValue.add(material.salePrice.mul(material.stock));
      if (material.costPrice) costValue = costValue.add(material.costPrice.mul(material.stock));
    }
    const lowStock = materials
      .filter((material) => material.stock <= material.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8)
      .map((material) => ({ id: material.id, name: material.name, sku: material.sku, stock: material.stock, minStock: material.minStock, unit: material.unit }));

    return {
      success: true,
      data: {
        products: materials.length,
        units,
        costValue: Number(costValue),
        saleValue: Number(saleValue),
        lowStock
      }
    };
  }

  /** Ultimos cierres de caja con diferencia contra lo esperado. */
  async getCashClosures(limit = 8) {
    const closures = await this.prisma.cashRegister.findMany({
      where: { status: "CLOSED" },
      orderBy: { closedAt: "desc" },
      take: limit
    });
    return {
      success: true,
      data: closures.map((closure) => ({
        id: closure.id,
        openedAt: closure.openedAt,
        closedAt: closure.closedAt,
        initialAmount: Number(closure.initialAmount),
        expectedAmount: Number(closure.expectedAmount),
        countedAmount: closure.countedAmount === null ? null : Number(closure.countedAmount),
        difference: closure.difference === null ? null : Number(closure.difference)
      }))
    };
  }
}
