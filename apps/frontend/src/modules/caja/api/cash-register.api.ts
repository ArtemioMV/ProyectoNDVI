import { httpClient } from "@/services/api/http-client";
import type { CashRegister, CloseCashRegisterPayload, CreateCashMovementPayload, OpenCashRegisterPayload } from "../types/cash-register.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function fetchCurrentCashRegister() {
  const response = await httpClient.get<ApiResponse<CashRegister | null>>("/caja/actual");
  return response.data.data;
}

export async function fetchCashRegisterHistory() {
  const response = await httpClient.get<ApiResponse<CashRegister[]>>("/caja/historial");
  return response.data.data;
}

export async function openCashRegister(payload: OpenCashRegisterPayload) {
  const response = await httpClient.post<ApiResponse<CashRegister>>("/caja/abrir", payload);
  return response.data.data;
}

export async function closeCashRegister(id: string, payload: CloseCashRegisterPayload) {
  const response = await httpClient.post<ApiResponse<CashRegister>>(`/caja/${id}/cerrar`, payload);
  return response.data.data;
}

export async function createCashMovement(id: string, payload: CreateCashMovementPayload) {
  const response = await httpClient.post<ApiResponse<unknown>>(`/caja/${id}/movimientos`, payload);
  return response.data.data;
}

export async function reopenCashRegister(id: string) {
  const response = await httpClient.post<ApiResponse<CashRegister>>(`/caja/${id}/reabrir`);
  return response.data.data;
}
