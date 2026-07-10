import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CashMovementSource, CashMovementType, CashRegisterStatus, ExpenseCategoryType, PaymentMethod, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { formatReceiptCode } from "../../shared/receipt-code";
import { CreateExpenseCategoryDto } from "./dto/create-expense-category.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategories() {
    const categories = await this.prisma.expenseCategory.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
    return { success: true, data: categories };
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    const category = await this.prisma.expenseCategory.create({
      data: {
        name: dto.name.trim(),
        type: dto.type ?? ExpenseCategoryType.OPERATING,
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true
      }
    });
    return { success: true, data: category, message: "Categoria de gasto creada" };
  }

  async findExpenses(period?: string) {
    const range = this.periodToRange(period);
    const expenses = await this.prisma.expense.findMany({
      where: range ? { expenseDate: { gte: range.start, lt: range.end } } : undefined,
      include: { category: true },
      orderBy: { expenseDate: "desc" },
      take: 100
    });
    return { success: true, data: expenses.map((expense) => this.toExpenseResponse(expense)) };
  }

  async createExpense(dto: CreateExpenseDto) {
    const expense = await this.prisma.$transaction(async (tx) => {
      const category = await tx.expenseCategory.findUnique({ where: { id: dto.categoryId } });
      if (!category || !category.isActive) {
        throw new BadRequestException("La categoria de gasto no existe o esta inactiva");
      }

      const amount = new Prisma.Decimal(dto.amount);
      const paidFromCash = dto.paidFromCash ?? true;
      const openCashRegister = paidFromCash ? await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } }) : null;
      if (paidFromCash && !openCashRegister) {
        throw new BadRequestException("Debe abrir caja antes de registrar gastos pagados desde caja");
      }

      const receiptCode = formatReceiptCode("G", (await tx.expense.count()) + 1);
      const created = await tx.expense.create({
        data: {
          receiptCode,
          categoryId: dto.categoryId,
          description: dto.description.trim(),
          amount,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
          paidFromCash,
          reference: dto.reference?.trim() || null,
          notes: dto.notes?.trim() || null,
          expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date()
        },
        include: { category: true }
      });

      if (paidFromCash && openCashRegister) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: openCashRegister.id,
            type: CashMovementType.EXPENSE,
            source: CashMovementSource.EXPENSE,
            referenceId: created.id,
            amount,
            description: `Gasto ${created.description}`
          }
        });
        await tx.cashRegister.update({
          where: { id: openCashRegister.id },
          data: { expectedAmount: { decrement: amount } }
        });
      }

      return created;
    });

    return { success: true, data: this.toExpenseResponse(expense), message: "Gasto registrado" };
  }


  /** Anula un gasto: si salio de caja, devuelve el efectivo y marca VOID. */
  async voidExpense(id: string) {
    const expense = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.expense.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException("Gasto no encontrado");
      if (existing.status === "VOID") throw new ConflictException("El gasto ya esta anulado");

      if (existing.paidFromCash) {
        const openCashRegister = await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
        if (!openCashRegister) throw new BadRequestException("Debe abrir caja para anular un gasto pagado en efectivo");
        await tx.cashMovement.create({
          data: {
            cashRegisterId: openCashRegister.id,
            type: CashMovementType.INCOME,
            source: CashMovementSource.EXPENSE,
            referenceId: existing.id,
            amount: existing.amount,
            description: `Anulacion gasto ${existing.id.slice(0, 8)}`
          }
        });
        await tx.cashRegister.update({
          where: { id: openCashRegister.id },
          data: { expectedAmount: { increment: existing.amount } }
        });
      }

      return tx.expense.update({ where: { id }, data: { status: "VOID" }, include: { category: true } });
    });

    return { success: true, data: { ...expense, amount: Number(expense.amount) }, message: "Gasto anulado" };
  }

  private periodToRange(period?: string) {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) return null;
    const [year, month] = period.split("-").map(Number);
    return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
  }

  private toExpenseResponse(expense: Prisma.ExpenseGetPayload<{ include: { category: true } }>) {
    return { ...expense, amount: Number(expense.amount) };
  }
}
