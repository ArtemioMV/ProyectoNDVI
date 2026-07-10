import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PlanType, Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreateServicePlanDto } from "./dto/create-service-plan.dto";
import { UpdateServicePlanDto } from "./dto/update-service-plan.dto";

@Injectable()
export class ServicePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: PlanType) {
    const plans = await this.prisma.servicePlan.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { monthlyPrice: "asc" }, { name: "asc" }]
    });

    return {
      success: true,
      data: plans.map((plan) => ({
        ...plan,
        monthlyPrice: Number(plan.monthlyPrice)
      }))
    };
  }

  async create(dto: CreateServicePlanDto) {
    try {
      const plan = await this.prisma.servicePlan.create({
        data: {
          type: dto.type,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          monthlyPrice: new Prisma.Decimal(dto.monthlyPrice),
          downloadMbps: dto.type === PlanType.INTERNET ? dto.downloadMbps ?? null : null,
          uploadMbps: dto.type === PlanType.INTERNET ? dto.uploadMbps ?? null : null,
          maxScreens: dto.type === PlanType.TV ? dto.maxScreens ?? null : null,
          isActive: dto.isActive ?? true
        }
      });

      return {
        success: true,
        data: {
          ...plan,
          monthlyPrice: Number(plan.monthlyPrice)
        },
        message: "Plan creado"
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un plan con ese nombre y tipo");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateServicePlanDto) {
    const existing = await this.prisma.servicePlan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Plan no encontrado");
    }

    const type = dto.type ?? existing.type;
    const data: Prisma.ServicePlanUpdateInput = {};

    if (dto.type !== undefined) data.type = dto.type;
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.monthlyPrice !== undefined) data.monthlyPrice = new Prisma.Decimal(dto.monthlyPrice);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    // Los campos de especificacion dependen del tipo: se limpian los que no aplican.
    if (dto.type !== undefined || dto.downloadMbps !== undefined || dto.uploadMbps !== undefined || dto.maxScreens !== undefined) {
      data.downloadMbps = type === PlanType.INTERNET ? dto.downloadMbps ?? existing.downloadMbps ?? null : null;
      data.uploadMbps = type === PlanType.INTERNET ? dto.uploadMbps ?? existing.uploadMbps ?? null : null;
      data.maxScreens = type === PlanType.TV ? dto.maxScreens ?? existing.maxScreens ?? null : null;
    }

    try {
      const plan = await this.prisma.servicePlan.update({ where: { id }, data });
      return {
        success: true,
        data: {
          ...plan,
          monthlyPrice: Number(plan.monthlyPrice)
        },
        message: "Plan actualizado"
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Ya existe un plan con ese nombre y tipo");
      }
      throw error;
    }
  }
}
