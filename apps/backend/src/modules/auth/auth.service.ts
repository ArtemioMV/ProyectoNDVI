import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username.trim() },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const roles = user.roles.map((item) => item.role.name);
    const permissions = Array.from(new Set(user.roles.flatMap((item) => item.role.permissions.map((rolePermission) => rolePermission.permission.code))));
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      roles,
      permissions
    });

    return {
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          roles,
          permissions
        }
      },
      message: "Sesion iniciada"
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Sesion invalida");
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        roles: user.roles.map((item) => item.role.name),
        permissions: Array.from(new Set(user.roles.flatMap((item) => item.role.permissions.map((rolePermission) => rolePermission.permission.code))))
      }
    };
  }
}
