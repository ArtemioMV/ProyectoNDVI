import { httpClient } from "@/services/api/http-client";
import type { CompanySettings } from "@/services/settings/company-settings";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function fetchPublicSystemSettings() {
  const response = await httpClient.get<ApiResponse<CompanySettings & { mailConfigured?: boolean }>>("/configuracion/publica");
  return response.data.data;
}

export async function fetchSystemSettings() {
  const response = await httpClient.get<ApiResponse<CompanySettings>>("/configuracion");
  return response.data.data;
}

export async function saveSystemSettings(payload: CompanySettings) {
  const response = await httpClient.put<ApiResponse<CompanySettings>>("/configuracion", payload);
  return response.data.data;
}
