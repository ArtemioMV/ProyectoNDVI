import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreatePartnerDto, UpdatePartnerDto } from "./dto/save-partner.dto";

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const partners = await this.prisma.partner.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    return { success: true, data: partners.map((partner) => this.toResponse(partner)) };
  }

  async create(dto: CreatePartnerDto) {
    await this.assertShareBudget(dto.sharePercent, dto.isActive ?? true, null);
    try {
      const partner = await this.prisma.partner.create({
        data: {
          name: dto.name.trim().toUpperCase(),
          sharePercent: new Prisma.Decimal(dto.sharePercent),
          isActive: dto.isActive ?? true,
          sortOrder: dto.sortOrder ?? 0
        }
      });
      return { success: true, data: this.toResponse(partner), message: "Socio registrado" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un socio con ese nombre");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePartnerDto) {
    const existing = await this.prisma.partner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Socio no encontrado");

    const nextShare = dto.sharePercent ?? Number(existing.sharePercent);
    const nextActive = dto.isActive ?? existing.isActive;
    await this.assertShareBudget(nextShare, nextActive, id);

    const data: Prisma.PartnerUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim().toUpperCase();
    if (dto.sharePercent !== undefined) data.sharePercent = new Prisma.Decimal(dto.sharePercent);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    try {
      const partner = await this.prisma.partner.update({ where: { id }, data });
      return { success: true, data: this.toResponse(partner), message: "Socio actualizado" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un socio con ese nombre");
      }
      throw error;
    }
  }

  /** La suma de participaciones de socios ACTIVOS no puede superar 100%. */
  private async assertShareBudget(share: number, isActive: boolean, excludeId: string | null) {
    if (!isActive) return;
    const others = await this.prisma.partner.findMany({ where: { isActive: true, ...(excludeId ? { id: { not: excludeId } } : {}) } });
    const total = others.reduce((sum, partner) => sum + Number(partner.sharePercent), 0) + share;
    if (total > 100.0001) {
      throw new BadRequestException(`La participacion total activa seria ${total.toFixed(2)}%: supera el 100%`);
    }
  }

  private toResponse(partner: { id: string; name: string; sharePercent: Prisma.Decimal; isActive: boolean; sortOrder: number }) {
    return { id: partner.id, name: partner.name, sharePercent: Number(partner.sharePercent), isActive: partner.isActive, sortOrder: partner.sortOrder };
  }
}
