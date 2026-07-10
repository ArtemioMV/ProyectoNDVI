import { httpClient } from "@/services/api/http-client";
import type { Material } from "@/modules/productos/types/products.types";
import type { CreateMaterialPurchasePayload, CreateSupplierPayload, MaterialPurchase, Supplier } from "../types/purchases.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function fetchPurchaseMaterials() {
  const response = await httpClient.get<ApiResponse<Material[]>>("/productos");
  return response.data.data;
}

export async function fetchSuppliers() {
  const response = await httpClient.get<ApiResponse<Supplier[]>>("/compras/proveedores");
  return response.data.data;
}

export async function createSupplier(payload: CreateSupplierPayload) {
  const response = await httpClient.post<ApiResponse<Supplier>>("/compras/proveedores", payload);
  return response.data.data;
}

export async function fetchPurchases() {
  const response = await httpClient.get<ApiResponse<MaterialPurchase[]>>("/compras");
  return response.data.data;
}

export async function createPurchase(payload: CreateMaterialPurchasePayload) {
  const response = await httpClient.post<ApiResponse<MaterialPurchase>>("/compras", payload);
  return response.data.data;
}

export async function voidMaterialPurchase(id: string) {
  const response = await httpClient.patch("/compras/" + id + "/anular");
  return response.data;
}

export async function updateSupplier(id: string, payload: Partial<CreateSupplierPayload>) {
  const response = await httpClient.patch<ApiResponse<Supplier>>(`/compras/proveedores/${id}`, payload);
  return response.data.data;
}
