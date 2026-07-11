import { httpClient } from "@/services/api/http-client";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export type Partner = {
  id: string;
  name: string;
  sharePercent: number;
  isActive: boolean;
  sortOrder: number;
};

export type SavePartnerPayload = {
  name?: string;
  sharePercent?: number;
  isActive?: boolean;
  sortOrder?: number;
};

export async function fetchPartners() {
  const response = await httpClient.get<ApiResponse<Partner[]>>("/socios");
  return response.data.data;
}

export async function createPartner(payload: SavePartnerPayload & { name: string; sharePercent: number }) {
  const response = await httpClient.post<ApiResponse<Partner>>("/socios", payload);
  return response.data.data;
}

export async function updatePartner(id: string, payload: SavePartnerPayload) {
  const response = await httpClient.patch<ApiResponse<Partner>>(`/socios/${id}`, payload);
  return response.data.data;
}
