import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CashMovementSource, CashMovementType, CashRegisterStatus, InventoryMovementType, PaymentMethod, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { formatReceiptCode } from "../../shared/receipt-code";
import { CreateMaterialPurchaseDto } from "./dto/create-material-purchase.dto";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findSuppliers() {
    const suppliers = await this.prisma.supplier.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
    return { success: true, data: suppliers };
  }

  async createSupplier(dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: dto.name.trim(),
        documentNumber: dto.documentNumber?.trim() || null,
        contactName: dto.contactName?.trim() || null,
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim() || null,
        country: dto.country?.trim() || "PE",
        department: dto.department?.trim() || null,
        province: dto.province?.trim() || null,
        district: dto.district?.trim() || null,
        address: dto.address?.trim() || null,
        reference: dto.reference?.trim() || null,
        notes: dto.notes?.trim() || null,
        isActive: dto.isActive ?? true
      }
    });
    return { success: true, data: supplier, message: "Proveedor creado" };
  }

  async findPurchases() {
    const purchases = await this.prisma.materialPurchase.findMany({
      include: { supplier: true, items: { include: { material: true } } },
      orderBy: { purchasedAt: "desc" },
      take: 50
    });
    return { success: true, data: purchases.map((purchase) => this.toPurchaseResponse(purchase)) };
  }

  async createPurchase(dto: CreateMaterialPurchaseDto) {
    const purchase = await this.prisma.$transaction(async (tx) => {
      const materialIds = dto.items.map((item) => item.materialId).filter(Boolean) as string[];
      const materials = await tx.material.findMany({ where: { id: { in: materialIds }, isActive: true } });
      const materialsById = new Map(materials.map((material) => [material.id, material]));

      for (const item of dto.items) {
        if (item.materialId && !materialsById.has(item.materialId)) {
          throw new BadRequestException("Uno de los productos no existe o esta inactivo");
        }
      }

      const paidFromCash = dto.paidFromCash ?? true;
      let totalAmount = new Prisma.Decimal(0);
      const items = dto.items.map((item) => {
        const unitCost = new Prisma.Decimal(item.unitCost);
        const subtotal = unitCost.mul(item.quantity);
        totalAmount = totalAmount.add(subtotal);
        return { ...item, unitCost, subtotal };
      });

      const openCashRegister = paidFromCash
        ? await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } })
        : null;
      if (paidFromCash && !openCashRegister) {
        throw new BadRequestException("Debe abrir caja antes de registrar compras pagadas desde caja");
      }

      const receiptCode = formatReceiptCode("C", (await tx.materialPurchase.count()) + 1);
      const createdPurchase = await tx.materialPurchase.create({
        data: {
          receiptCode,
          supplierId: dto.supplierId || null,
          supplierName: dto.supplierName?.trim() || null,
          documentNumber: dto.documentNumber?.trim() || null,
          receiptNumber: dto.receiptNumber?.trim() || null,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
          paidFromCash,
          notes: dto.notes?.trim() || null,
          totalAmount,
          purchasedAt: dto.purchasedAt ? new Date(dto.purchasedAt) : new Date(),
          items: {
            create: items.map((item) => ({
              materialId: item.materialId || null,
              description: item.description.trim(),
              quantity: item.quantity,
              quantityText: item.quantityText?.trim() || null,
              unitCost: item.unitCost,
              subtotal: item.subtotal
            }))
          }
        },
        include: { supplier: true, items: { include: { material: true } } }
      });

      for (const item of items) {
        if (!item.materialId) continue;
        await tx.material.update({
          where: { id: item.materialId },
          data: { stock: { increment: item.quantity }, costPrice: item.unitCost }
        });
        await tx.materialMovement.create({
          data: {
            materialId: item.materialId,
            type: InventoryMovementType.PURCHASE,
            quantity: item.quantity,
            unitCost: item.unitCost,
            reason: item.description.trim(),
            reference: createdPurchase.id
          }
        });
      }

      if (paidFromCash && openCashRegister) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: openCashRegister.id,
            type: CashMovementType.EXPENSE,
            source: CashMovementSource.PURCHASE,
            referenceId: createdPurchase.id,
            amount: totalAmount,
            description: `Compra ${createdPurchase.receiptNumber || createdPurchase.id.slice(0, 8)}`
          }
        });
        await tx.cashRegister.update({
          where: { id: openCashRegister.id },
          data: { expectedAmount: { decrement: totalAmount } }
        });
      }

      return createdPurchase;
    });

    return { success: true, data: this.toPurchaseResponse(purchase), message: "Compra registrada" };
  }


  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Proveedor no encontrado");

    const trimOrNull = (value?: string) => value?.trim() || null;
    const data: Prisma.SupplierUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.documentNumber !== undefined) data.documentNumber = trimOrNull(dto.documentNumber);
    if (dto.contactName !== undefined) data.contactName = trimOrNull(dto.contactName);
    if (dto.phone !== undefined) data.phone = trimOrNull(dto.phone);
    if (dto.email !== undefined) data.email = trimOrNull(dto.email);
    if (dto.country !== undefined) data.country = dto.country?.trim() || "PE";
    if (dto.department !== undefined) data.department = trimOrNull(dto.department);
    if (dto.province !== undefined) data.province = trimOrNull(dto.province);
    if (dto.district !== undefined) data.district = trimOrNull(dto.district);
    if (dto.address !== undefined) data.address = trimOrNull(dto.address);
    if (dto.reference !== undefined) data.reference = trimOrNull(dto.reference);
    if (dto.notes !== undefined) data.notes = trimOrNull(dto.notes);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    try {
      const supplier = await this.prisma.supplier.update({ where: { id }, data });
      return { success: true, data: supplier, message: "Proveedor actualizado" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un proveedor con ese nombre");
      }
      throw error;
    }
  }

  /** Anula una compra: retira el stock ingresado y, si salio de caja, devuelve el efectivo. */
  async voidPurchase(id: string) {
    const purchase = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.materialPurchase.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new NotFoundException("Compra no encontrada");
      if (existing.status === "VOID") throw new ConflictException("La compra ya esta anulada");

      for (const item of existing.items) {
        if (!item.materialId) continue;
        const material = await tx.material.findUnique({ where: { id: item.materialId } });
        if (!material) continue;
        if (material.stock < item.quantity) {
          throw new BadRequestException(`No se puede anular: el stock de ${material.name} ya fue consumido`);
        }
        await tx.material.update({ where: { id: item.materialId }, data: { stock: { decrement: item.quantity } } });
        await tx.materialMovement.create({
          data: {
            materialId: item.materialId,
            type: InventoryMovementType.ADJUSTMENT_OUT,
            quantity: item.quantity,
            unitCost: item.unitCost,
            reason: "Anulacion de compra",
            reference: existing.id
          }
        });
      }

      if (existing.paidFromCash) {
        const openCashRegister = await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
        if (!openCashRegister) throw new BadRequestException("Debe abrir caja para anular una compra pagada en efectivo");
        await tx.cashMovement.create({
          data: {
            cashRegisterId: openCashRegister.id,
            type: CashMovementType.INCOME,
            source: CashMovementSource.PURCHASE,
            referenceId: existing.id,
            amount: existing.totalAmount,
            description: `Anulacion compra ${existing.id.slice(0, 8)}`
          }
        });
        await tx.cashRegister.update({
          where: { id: openCashRegister.id },
          data: { expectedAmount: { increment: existing.totalAmount } }
        });
      }

      return tx.materialPurchase.update({
        where: { id },
        data: { status: "VOID" },
        include: { items: { include: { material: true } }, supplier: true }
      });
    });

    return { success: true, data: purchase, message: "Compra anulada" };
  }

  private toPurchaseResponse(
    purchase: Prisma.MaterialPurchaseGetPayload<{ include: { supplier: true; items: { include: { material: true } } } }>
  ) {
    return {
      ...purchase,
      totalAmount: Number(purchase.totalAmount),
      items: purchase.items.map((item) => ({
        ...item,
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
        material: item.material
          ? {
              ...item.material,
              costPrice: item.material.costPrice === null ? null : Number(item.material.costPrice),
              salePrice: Number(item.material.salePrice),
              isLowStock: item.material.stock <= item.material.minStock
            }
          : null
      }))
    };
  }
}

