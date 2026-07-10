import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { UpdateSystemSettingsDto } from "./dto/update-system-settings.dto";

type SystemSettings = {
  companyName: string;
  tagline: string;
  loginHeadline: string;
  loginSubline: string;
  loginFooter: string;
  logoUrl: string | null;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  sessionDays: number;
  mailHost: string;
  mailPort: string;
  mailUser: string;
  mailPassword: string;
  mailFrom: string;
  mailSecure: boolean;
};

const SETTINGS_KEY = "system";
const defaults: SystemSettings = {
  companyName: "NovaLink",
  tagline: "Panel administrativo",
  loginHeadline: "Bienvenido de vuelta.",
  loginSubline: "Gestiona clientes, servicios, mensualidades y caja desde un solo lugar.",
  loginFooter: "Solo personal autorizado",
  logoUrl: null,
  ruc: "",
  address: "",
  phone: "",
  email: "",
  sessionDays: 7,
  mailHost: "",
  mailPort: "587",
  mailUser: "",
  mailPassword: "",
  mailFrom: "",
  mailSecure: false
};

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic() {
    const settings = await this.getSettings();
    return { success: true, data: this.toPublic(settings) };
  }

  async getPrivate() {
    const settings = await this.getSettings();
    return { success: true, data: this.toPrivate(settings) };
  }

  async update(dto: UpdateSystemSettingsDto) {
    const current = await this.getSettings();
    const patch = this.cleanPatch(dto);
    if (patch.mailPassword === "********") delete patch.mailPassword;
    const next = { ...current, ...patch };
    await this.prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: next as unknown as Prisma.InputJsonValue, isSecret: true },
      update: { value: next as unknown as Prisma.InputJsonValue, isSecret: true }
    });
    return { success: true, data: this.toPrivate(next), message: "Configuracion guardada" };
  }

  private async getSettings(): Promise<SystemSettings> {
    const row = await this.prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row || typeof row.value !== "object" || row.value === null || Array.isArray(row.value)) return defaults;
    return { ...defaults, ...(row.value as Partial<SystemSettings>) };
  }

  private cleanPatch(dto: UpdateSystemSettingsDto): Partial<SystemSettings> {
    return Object.fromEntries(Object.entries(dto).filter(([, value]) => value !== undefined)) as Partial<SystemSettings>;
  }

  private toPublic(settings: SystemSettings) {
    const { mailHost, mailPort, mailUser, mailPassword, mailFrom, mailSecure, ...publicSettings } = settings;
    return {
      ...publicSettings,
      mailConfigured: Boolean(mailHost && mailPort && mailUser && mailFrom),
      mailSecure
    };
  }

  private toPrivate(settings: SystemSettings) {
    return {
      ...settings,
      mailPassword: settings.mailPassword ? "********" : ""
    };
  }
}
