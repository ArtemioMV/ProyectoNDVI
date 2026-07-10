import { httpClient } from "@/services/api/http-client";
import type { Material } from "@/modules/productos/types/products.types";
import type { CreateMaterialSalePayload, MaterialSale } from "../types/sales.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function fetchSaleMaterials() {
  const response = await httpClient.get<ApiResponse<Material[]>>("/productos");
  return response.data.data;
}

export async function fetchMaterialSales() {
  const response = await httpClient.get<ApiResponse<MaterialSale[]>>("/ventas");
  return response.data.data;
}

export async function createMaterialSale(payload: CreateMaterialSalePayload) {
  const response = await httpClient.post<ApiResponse<MaterialSale>>("/ventas", payload);
  return response.data.data;
}

export async function voidMaterialSale(id: string) {
  const response = await httpClient.patch("/ventas/" + id + "/anular");
  return response.data;
}
