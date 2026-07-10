import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: "asc" } });
    return { success: true, data: roles.map((role) => this.toResponse(role)) };
  }

  async create(dto: CreateRoleDto) {
    const name = dto.name.trim().toUpperCase();
    const existing = await this.prisma.role.findUnique({ where: { name } });
    if (existing) throw new ConflictException("El rol ya existe");

    const role = await this.prisma.$transaction(async (tx) => {
      const created = await tx.role.create({ data: { name, description: dto.description?.trim() || null } });
      if (dto.permissions?.length) {
        const permissions = await tx.permission.findMany({ where: { code: { in: dto.permissions } } });
        await tx.rolePermission.createMany({ data: permissions.map((permission) => ({ roleId: created.id, permissionId: permission.id })), skipDuplicates: true });
      }
      return tx.role.findUniqueOrThrow({ where: { id: created.id }, include: { permissions: { include: { permission: true } } } });
    });
    return { success: true, data: this.toResponse(role), message: "Rol creado" };
  }

  async update(id: string, dto: UpdateRoleDto) {
    const current = await this.prisma.role.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("El rol no existe");

    const role = await this.prisma.$transaction(async (tx) => {
      await tx.role.update({ where: { id }, data: { name: dto.name?.trim().toUpperCase(), description: dto.description?.trim() || undefined } });
      if (dto.permissions) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        const permissions = await tx.permission.findMany({ where: { code: { in: dto.permissions } } });
        await tx.rolePermission.createMany({ data: permissions.map((permission) => ({ roleId: id, permissionId: permission.id })), skipDuplicates: true });
      }
      return tx.role.findUniqueOrThrow({ where: { id }, include: { permissions: { include: { permission: true } } } });
    });
    return { success: true, data: this.toResponse(role), message: "Rol actualizado" };
  }

  private toResponse(role: { id: string; name: string; description: string | null; permissions: Array<{ permission: { code: string } }> }) {
    return { id: role.id, name: role.name, description: role.description, permissions: role.permissions.map((item) => item.permission.code).sort() };
  }
}
