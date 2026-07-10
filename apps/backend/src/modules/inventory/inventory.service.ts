import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CashMovementSource, CashMovementType, CashRegisterStatus, InventoryMovementType, PaymentMethod, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { formatReceiptCode } from "../../shared/receipt-code";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { CreateMaterialMovementDto } from "./dto/create-material-movement.dto";
import { CreateMaterialSaleDto } from "./dto/create-material-sale.dto";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findMaterials(search?: string) {
    const normalizedSearch = search?.trim();
    const materials = await this.prisma.material.findMany({
      where: normalizedSearch
        ? {
            OR: [
              { name: { contains: normalizedSearch, mode: "insensitive" } },
              { sku: { contains: normalizedSearch, mode: "insensitive" } }
            ]
          }
        : undefined,
      orderBy: [{ isActive: "desc" }, { name: "asc" }]
    });

    return {
      success: true,
      data: materials.map((material) => this.toMaterialResponse(material))
    };
  }

  async createMaterial(dto: CreateMaterialDto) {
    try {
      const material = await this.prisma.$transaction(async (tx) => {
        const created = await tx.material.create({
          data: {
            sku: dto.sku?.trim() || null,
            name: dto.name.trim(),
            description: dto.description?.trim() || null,
            unit: dto.unit.trim().toUpperCase(),
            costPrice: null,
            salePrice: new Prisma.Decimal(dto.salePrice),
            coveragePrice: dto.coveragePrice === undefined ? null : new Prisma.Decimal(dto.coveragePrice),
            installPrice: dto.installPrice === undefined ? null : new Prisma.Decimal(dto.installPrice),
            isInstallationMaterial: dto.isInstallationMaterial ?? false,
            imageUrl: dto.imageUrl?.trim() || null,
            stock: 0,
            minStock: dto.minStock ?? 0,
            isActive: dto.isActive ?? true
          }
        });

        return created;
      });

      return {
        success: true,
        data: this.toMaterialResponse(material),
        message: "Material creado"
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un material con ese SKU o nombre");
      }
      throw error;
    }
  }

  /** Actualiza datos comerciales del producto; stock solo cambia via movimientos. */
  async updateMaterial(id: string, dto: UpdateMaterialDto) {
    const existing = await this.prisma.material.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Producto no encontrado");

    const data: Prisma.MaterialUpdateInput = {};
    if (dto.sku !== undefined) data.sku = dto.sku?.trim() || null;
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.unit !== undefined) data.unit = dto.unit.trim().toUpperCase();
    if (dto.salePrice !== undefined) data.salePrice = new Prisma.Decimal(dto.salePrice);
    if (dto.coveragePrice !== undefined) data.coveragePrice = dto.coveragePrice === null ? null : new Prisma.Decimal(dto.coveragePrice);
    if (dto.installPrice !== undefined) data.installPrice = dto.installPrice === null ? null : new Prisma.Decimal(dto.installPrice);
    if (dto.isInstallationMaterial !== undefined) data.isInstallationMaterial = dto.isInstallationMaterial;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl?.trim() || null;
    if (dto.minStock !== undefined) data.minStock = dto.minStock;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    try {
      const material = await this.prisma.material.update({ where: { id }, data });
      return { success: true, data: this.toMaterialResponse(material), message: "Producto actualizado" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un material con ese SKU o nombre");
      }
      throw error;
    }
  }

  async createMovement(materialId: string, dto: CreateMaterialMovementDto) {
    if (dto.type === InventoryMovementType.PURCHASE) {
      throw new BadRequestException("Las compras y costos se registran desde el modulo Compras");
    }
    if (dto.type === InventoryMovementType.SALE) {
      throw new BadRequestException("Las salidas por venta se registran desde venta de materiales");
    }

    const material = await this.prisma.$transaction(async (tx) => {
      const current = await tx.material.findUnique({ where: { id: materialId } });
      if (!current) {
        throw new NotFoundException("El material no existe");
      }

      const inboundTypes: InventoryMovementType[] = [
        InventoryMovementType.RETURN,
        InventoryMovementType.ADJUSTMENT_IN
      ];
      const quantityDelta = inboundTypes.includes(dto.type) ? dto.quantity : -dto.quantity;
      const nextStock = current.stock + quantityDelta;
      if (nextStock < 0) {
        throw new BadRequestException("El movimiento deja el stock en negativo");
      }

      await tx.materialMovement.create({
        data: {
          materialId,
          type: dto.type,
          quantity: dto.quantity,
          unitCost: null,
          reason: dto.reason?.trim() || null,
          reference: dto.reference?.trim() || null
        }
      });

      return tx.material.update({
        where: { id: materialId },
        data: {
          stock: nextStock
        }
      });
    });

    return {
      success: true,
      data: this.toMaterialResponse(material),
      message: "Movimiento registrado"
    };
  }

  async findSales() {
    const sales = await this.prisma.materialSale.findMany({
      include: { items: { include: { material: true } } },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      success: true,
      data: sales.map((sale) => this.toSaleResponse(sale))
    };
  }

  async createSale(dto: CreateMaterialSaleDto) {
    const repeatedMaterialIds = new Set<string>();
    for (const item of dto.items) {
      if (repeatedMaterialIds.has(item.materialId)) {
        throw new BadRequestException("No repitas el mismo material en una venta");
      }
      repeatedMaterialIds.add(item.materialId);
    }

    const sale = await this.prisma.$transaction(async (tx) => {
      const openCashRegister = await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
      if (!openCashRegister) {
        throw new BadRequestException("Debe abrir caja antes de registrar ventas");
      }

      const materials = await tx.material.findMany({
        where: { id: { in: dto.items.map((item) => item.materialId) }, isActive: true }
      });
      const materialsById = new Map(materials.map((material) => [material.id, material]));

      let grossAmount = new Prisma.Decimal(0);
      const saleItems = dto.items.map((item) => {
        const material = materialsById.get(item.materialId);
        if (!material) {
          throw new BadRequestException("Uno de los materiales seleccionados no existe o esta inactivo");
        }
        if (material.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${material.name}`);
        }

        const subtotal = material.salePrice.mul(item.quantity);
        grossAmount = grossAmount.add(subtotal);
        return { material, quantity: item.quantity, subtotal };
      });

      const discountAmount = new Prisma.Decimal(dto.discountAmount ?? 0);
      if (discountAmount.gt(grossAmount)) {
        throw new BadRequestException("El descuento no puede superar el total bruto");
      }
      const totalAmount = grossAmount.sub(discountAmount);

      const receiptCode = formatReceiptCode("V", (await tx.materialSale.count()) + 1);
      const createdSale = await tx.materialSale.create({
        data: {
          receiptCode,
          customerName: dto.customerName?.trim() || null,
          documentNumber: dto.documentNumber?.trim() || null,
          notes: dto.notes?.trim() || null,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
          discountAmount,
          totalAmount,
          items: {
            create: saleItems.map((item) => ({
              materialId: item.material.id,
              quantity: item.quantity,
              unitPrice: item.material.salePrice,
              subtotal: item.subtotal
            }))
          }
        },
        include: { items: { include: { material: true } } }
      });

      for (const item of saleItems) {
        await tx.material.update({
          where: { id: item.material.id },
          data: { stock: { decrement: item.quantity } }
        });
        await tx.materialMovement.create({
          data: {
            materialId: item.material.id,
            type: InventoryMovementType.SALE,
            quantity: item.quantity,
            unitPrice: item.material.salePrice,
            reason: "Venta de materiales",
            reference: createdSale.id
          }
        });
      }

      await tx.cashMovement.create({
        data: {
          cashRegisterId: openCashRegister.id,
          type: CashMovementType.INCOME,
          source: CashMovementSource.SALE,
          referenceId: createdSale.id,
          amount: totalAmount,
          description: `Venta ${createdSale.id.slice(0, 8)}`
        }
      });
      await tx.cashRegister.update({
        where: { id: openCashRegister.id },
        data: { expectedAmount: { increment: totalAmount } }
      });

      return createdSale;
    });

    return {
      success: true,
      data: this.toSaleResponse(sale),
      message: "Venta registrada"
    };
  }

  /** Anula una venta: repone stock, registra egreso en caja (exige caja abierta) y marca VOID. */
  async voidSale(id: string) {
    const sale = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.materialSale.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new NotFoundException("Venta no encontrada");
      if (existing.status === "VOID") throw new ConflictException("La venta ya esta anulada");

      const openCashRegister = await tx.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } });
      if (!openCashRegister) throw new BadRequestException("Debe abrir caja para anular la venta (reverso de efectivo)");

      for (const item of existing.items) {
        await tx.material.update({ where: { id: item.materialId }, data: { stock: { increment: item.quantity } } });
        await tx.materialMovement.create({
          data: {
            materialId: item.materialId,
            type: InventoryMovementType.RETURN,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            reason: "Anulacion de venta",
            reference: existing.id
          }
        });
      }

      await tx.cashMovement.create({
        data: {
          cashRegisterId: openCashRegister.id,
          type: CashMovementType.EXPENSE,
          source: CashMovementSource.SALE,
          referenceId: existing.id,
          amount: existing.totalAmount,
          description: `Anulacion venta ${existing.id.slice(0, 8)}`
        }
      });
      await tx.cashRegister.update({
        where: { id: openCashRegister.id },
        data: { expectedAmount: { decrement: existing.totalAmount } }
      });

      return tx.materialSale.update({
        where: { id },
        data: { status: "VOID" },
        include: { items: { include: { material: true } } }
      });
    });

    return { success: true, data: this.toSaleResponse(sale), message: "Venta anulada" };
  }

  private toMaterialResponse(material: Prisma.MaterialGetPayload<object>) {
    return {
      ...material,
      costPrice: material.costPrice === null ? null : Number(material.costPrice),
      salePrice: Number(material.salePrice),
      coveragePrice: material.coveragePrice === null ? null : Number(material.coveragePrice),
      installPrice: material.installPrice === null ? null : Number(material.installPrice),
      isLowStock: material.stock <= material.minStock
    };
  }

  private toSaleResponse(
    sale: Prisma.MaterialSaleGetPayload<{ include: { items: { include: { material: true } } } }>
  ) {
    return {
      ...sale,
      discountAmount: Number(sale.discountAmount),
      totalAmount: Number(sale.totalAmount),
      items: sale.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        material: this.toMaterialResponse(item.material)
      }))
    };
  }
}
