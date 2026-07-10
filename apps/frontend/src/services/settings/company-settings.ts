import { useSyncExternalStore } from "react";
import { branding } from "@/config/branding";

/**
 * Datos de empresa y sistema. Se leen del backend; localStorage queda como cache
 * offline para que login/contrato no queden vacios si la API tarda o cae.
 */
export type CompanySettings = {
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

const STORAGE_KEY = "novalink.company-settings";

export const defaultCompanySettings: CompanySettings = {
  companyName: branding.companyName,
  tagline: branding.tagline,
  loginHeadline: branding.loginHeadline,
  loginSubline: branding.loginSubline,
  loginFooter: branding.loginFooter,
  logoUrl: branding.logoUrl,
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

let cache: CompanySettings | null = null;
const listeners = new Set<() => void>();

function readLocal(): CompanySettings {
  if (typeof window === "undefined") return defaultCompanySettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultCompanySettings, ...(JSON.parse(raw) as Partial<CompanySettings>) } : defaultCompanySettings;
  } catch {
    return defaultCompanySettings;
  }
}

function persistLocal(settings: CompanySettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota/serialization errors
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getCompanySettings(): CompanySettings {
  if (!cache) cache = readLocal();
  return cache;
}

export function setCompanySettings(settings: Partial<CompanySettings>) {
  cache = { ...getCompanySettings(), ...settings };
  if (typeof window !== "undefined") persistLocal(cache);
  emit();
}

export function saveCompanySettings(patch: Partial<CompanySettings>) {
  setCompanySettings(patch);
}

export async function hydrateCompanySettings() {
  try {
    const { fetchPublicSystemSettings } = await import("@/modules/configuracion/api/system-settings.api");
    setCompanySettings(await fetchPublicSystemSettings());
  } catch {
    cache = readLocal();
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Hook reactivo: se re-renderiza cuando se guardan cambios de empresa. */
export function useCompanySettings(): CompanySettings {
  return useSyncExternalStore(subscribe, getCompanySettings, () => defaultCompanySettings);
}
