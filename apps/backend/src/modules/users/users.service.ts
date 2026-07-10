import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { username: "asc" }
    });
    return { success: true, data: users.map((user) => this.toResponse(user)) };
  }

  async create(dto: CreateUserDto) {
    const username = dto.username.trim();
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) throw new ConflictException("El usuario ya existe");

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          username,
          passwordHash: await bcrypt.hash(dto.password, 12),
          isActive: dto.isActive ?? true
        }
      });

      if (dto.roles?.length) {
        const roles = await tx.role.findMany({ where: { name: { in: dto.roles } } });
        await tx.userRole.createMany({ data: roles.map((role) => ({ userId: created.id, roleId: role.id })), skipDuplicates: true });
      }
      return tx.user.findUniqueOrThrow({ where: { id: created.id }, include: { roles: { include: { role: true } } } });
    });

    return { success: true, data: this.toResponse(user), message: "Usuario creado" };
  }

  async update(id: string, dto: UpdateUserDto) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("El usuario no existe");

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          username: dto.username?.trim(),
          passwordHash: dto.password ? await bcrypt.hash(dto.password, 12) : undefined,
          isActive: dto.isActive
        }
      });

      if (dto.roles) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        const roles = await tx.role.findMany({ where: { name: { in: dto.roles } } });
        await tx.userRole.createMany({ data: roles.map((role) => ({ userId: id, roleId: role.id })), skipDuplicates: true });
      }
      return tx.user.findUniqueOrThrow({ where: { id }, include: { roles: { include: { role: true } } } });
    });

    return { success: true, data: this.toResponse(user), message: "Usuario actualizado" };
  }

  private toResponse(user: { id: string; username: string; isActive: boolean; createdAt: Date; updatedAt: Date; roles: Array<{ role: { name: string } }> }) {
    return {
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      roles: user.roles.map((item) => item.role.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
