import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CashMovementSource, CashMovementType, CashRegisterStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { formatReceiptCode } from "../../shared/receipt-code";
import { CloseCashRegisterDto } from "./dto/close-cash-register.dto";
import { CreateManualCashMovementDto } from "./dto/create-manual-cash-movement.dto";
import { OpenCashRegisterDto } from "./dto/open-cash-register.dto";
import type { AuthenticatedUser } from "../../common/auth/types";

@Injectable()
export class CashRegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent() {
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: { status: CashRegisterStatus.OPEN },
      include: { movements: { include: { user: true }, orderBy: { createdAt: "desc" } } },
      orderBy: { openedAt: "desc" }
    });

    return { success: true, data: cashRegister ? this.toResponse(cashRegister) : null };
  }

  async findAll() {
    const cashRegisters = await this.prisma.cashRegister.findMany({
      include: { movements: { include: { user: true }, orderBy: { createdAt: "desc" } } },
      orderBy: { openedAt: "desc" },
      take: 50
    });

    return { success: true, data: cashRegisters.map((cashRegister) => this.toResponse(cashRegister)) };
  }

  async open(dto: OpenCashRegisterDto) {
    const existing = await this.prisma.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
    if (existing) {
      throw new BadRequestException("Ya existe una caja abierta");
    }

    const initialAmount = new Prisma.Decimal(dto.initialAmount);
    const cashRegister = await this.prisma.cashRegister.create({
      data: {
        initialAmount,
        expectedAmount: initialAmount,
        notes: dto.notes?.trim() || null
      },
      include: { movements: { include: { user: true } } }
    });

    return { success: true, data: this.toResponse(cashRegister), message: "Caja abierta" };
  }

  async close(id: string, dto: CloseCashRegisterDto) {
    const cashRegister = await this.prisma.cashRegister.findUnique({ where: { id }, include: { movements: { include: { user: true } } } });
    if (!cashRegister) {
      throw new NotFoundException("La caja no existe");
    }
    if (cashRegister.status !== CashRegisterStatus.OPEN) {
      throw new BadRequestException("La caja ya esta cerrada");
    }

    const countedAmount = new Prisma.Decimal(dto.countedAmount);
    const difference = countedAmount.sub(cashRegister.expectedAmount);
    const closed = await this.prisma.cashRegister.update({
      where: { id },
      data: {
        status: CashRegisterStatus.CLOSED,
        closedAt: new Date(),
        countedAmount,
        difference,
        notes: dto.notes?.trim() || cashRegister.notes
      },
      include: { movements: { include: { user: true }, orderBy: { createdAt: "desc" } } }
    });

    return { success: true, data: this.toResponse(closed), message: "Caja cerrada" };
  }

  /** Reabre una caja cerrada (correcciones). Solo si no hay otra caja abierta. */
  async reopen(id: string) {
    const cashRegister = await this.prisma.cashRegister.findUnique({ where: { id } });
    if (!cashRegister) throw new NotFoundException("La caja no existe");
    if (cashRegister.status === CashRegisterStatus.OPEN) throw new BadRequestException("La caja ya esta abierta");

    const otherOpen = await this.prisma.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
    if (otherOpen) throw new BadRequestException("Cierra la caja abierta actual antes de reabrir otra");

    const reopened = await this.prisma.cashRegister.update({
      where: { id },
      data: { status: CashRegisterStatus.OPEN, closedAt: null, countedAmount: null, difference: null },
      include: { movements: { include: { user: true }, orderBy: { createdAt: "desc" } } }
    });

    return { success: true, data: this.toResponse(reopened), message: "Caja reabierta" };
  }

  async createManualMovement(id: string, dto: CreateManualCashMovementDto, user?: AuthenticatedUser) {
    const cashRegister = await this.prisma.cashRegister.findUnique({ where: { id } });
    if (!cashRegister || cashRegister.status !== CashRegisterStatus.OPEN) {
      throw new BadRequestException("No hay caja abierta para registrar el movimiento");
    }

    const movement = await this.prisma.$transaction(async (tx) => {
      const amount = new Prisma.Decimal(dto.amount);
      const expectedDelta = dto.type === CashMovementType.INCOME ? amount : amount.neg();
      const receiptCode = formatReceiptCode("M", (await tx.cashMovement.count({ where: { source: CashMovementSource.MANUAL } })) + 1);
      const created = await tx.cashMovement.create({
        data: {
          cashRegisterId: id,
          receiptCode,
          type: dto.type,
          source: CashMovementSource.MANUAL,
          referenceId: dto.referenceId?.trim() || null,
          userId: user?.id,
          amount,
          description: dto.description.trim()
        },
        include: { user: true }
      });
      await tx.cashRegister.update({
        where: { id },
        data: { expectedAmount: { increment: expectedDelta } }
      });
      return created;
    });

    return { success: true, data: this.toMovementResponse(movement), message: "Movimiento de caja registrado" };
  }

  private toResponse(cashRegister: Prisma.CashRegisterGetPayload<{ include: { movements: { include: { user: true } } } }>) {
    return {
      ...cashRegister,
      initialAmount: Number(cashRegister.initialAmount),
      expectedAmount: Number(cashRegister.expectedAmount),
      countedAmount: cashRegister.countedAmount === null ? null : Number(cashRegister.countedAmount),
      difference: cashRegister.difference === null ? null : Number(cashRegister.difference),
      movements: cashRegister.movements.map((movement) => this.toMovementResponse(movement))
    };
  }

  private toMovementResponse(movement: Prisma.CashMovementGetPayload<{ include: { user: true } }>) {
    return {
      ...movement,
      amount: Number(movement.amount),
      user: movement.user ? { id: movement.user.id, username: movement.user.username } : null
    };
  }
}


