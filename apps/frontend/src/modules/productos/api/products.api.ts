import { httpClient } from "@/services/api/http-client";
import type { CreateMaterialMovementPayload, CreateMaterialPayload, Material } from "../types/products.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function fetchMaterials(search: string) {
  const response = await httpClient.get<ApiResponse<Material[]>>("/productos", {
    params: search ? { search } : undefined
  });
  return response.data.data;
}

export async function createMaterial(payload: CreateMaterialPayload) {
  const response = await httpClient.post<ApiResponse<Material>>("/productos", payload);
  return response.data.data;
}

export async function createMaterialMovement(materialId: string, payload: CreateMaterialMovementPayload) {
  const response = await httpClient.post<ApiResponse<Material>>(`/productos/${materialId}/movimientos`, payload);
  return response.data.data;
}

export async function updateMaterial(id: string, payload: Partial<CreateMaterialPayload> & { isActive?: boolean }) {
  const response = await httpClient.patch<ApiResponse<Material>>(`/productos/${id}`, payload);
  return response.data.data;
}
