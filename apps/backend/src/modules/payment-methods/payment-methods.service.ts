import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PaymentMethod } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { UpsertPaymentMethodDto } from "./dto/upsert-payment-method.dto";

const defaultMethods: Array<{ method: PaymentMethod; label: string; description: string; requiresEvidence: boolean; sortOrder: number }> = [
  { method: PaymentMethod.CASH, label: "Efectivo", description: "Pago en caja", requiresEvidence: false, sortOrder: 10 },
  { method: PaymentMethod.YAPE, label: "Yape", description: "Billetera Yape", requiresEvidence: true, sortOrder: 20 },
  { method: PaymentMethod.PLIN, label: "Plin", description: "Billetera Plin", requiresEvidence: true, sortOrder: 30 },
  { method: PaymentMethod.TRANSFER, label: "Transferencia", description: "Deposito o transferencia", requiresEvidence: true, sortOrder: 40 },
  { method: PaymentMethod.CARD, label: "Tarjeta", description: "POS o tarjeta", requiresEvidence: true, sortOrder: 50 },
  { method: PaymentMethod.OTHER, label: "Otro", description: "Otro metodo", requiresEvidence: true, sortOrder: 60 }
];

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    await this.ensureDefaults();
    const methods = await this.prisma.paymentMethodSetting.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] });
    return { success: true, data: methods };
  }

  async upsert(dto: UpsertPaymentMethodDto) {
    if (!dto.method) throw new BadRequestException("Metodo requerido");
    const method = await this.prisma.paymentMethodSetting.upsert({
      where: { method: dto.method },
      update: {
        label: dto.label?.trim(),
        description: dto.description?.trim() || null,
        requiresEvidence: dto.requiresEvidence,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder
      },
      create: {
        method: dto.method,
        label: dto.label?.trim() || dto.method,
        description: dto.description?.trim() || null,
        requiresEvidence: dto.requiresEvidence ?? dto.method !== PaymentMethod.CASH,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 100
      }
    });
    return { success: true, data: method, message: "Metodo de pago guardado" };
  }

  async update(id: string, dto: UpsertPaymentMethodDto) {
    const existing = await this.prisma.paymentMethodSetting.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("El metodo de pago no existe");
    const method = await this.prisma.paymentMethodSetting.update({
      where: { id },
      data: {
        label: dto.label?.trim(),
        description: dto.description?.trim() || undefined,
        requiresEvidence: dto.requiresEvidence,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder
      }
    });
    return { success: true, data: method, message: "Metodo de pago actualizado" };
  }

  private async ensureDefaults() {
    for (const method of defaultMethods) {
      await this.prisma.paymentMethodSetting.upsert({ where: { method: method.method }, update: {}, create: method });
    }
  }
}
