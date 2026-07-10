import { httpClient } from "@/services/api/http-client";
import type { PaymentMethodKey } from "@/constants/payment-methods";

type ApiResponse<T> = { data: T; message?: string };

export type PaymentMethodSetting = {
  id: string;
  method: PaymentMethodKey;
  label: string;
  description?: string | null;
  requiresEvidence: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type SavePaymentMethodSettingPayload = {
  label: string;
  description?: string;
  requiresEvidence: boolean;
  isActive: boolean;
  sortOrder: number;
};

export async function fetchPaymentMethodSettings() {
  const response = await httpClient.get<ApiResponse<PaymentMethodSetting[]>>("/metodos-pago");
  return response.data.data;
}

export async function savePaymentMethodSetting(id: string, payload: SavePaymentMethodSettingPayload) {
  const response = await httpClient.patch<ApiResponse<PaymentMethodSetting>>(`/metodos-pago/${id}`, payload);
  return response.data.data;
}

export async function createPaymentMethodSetting(payload: SavePaymentMethodSettingPayload & { method: PaymentMethodKey }) {
  const response = await httpClient.post<ApiResponse<PaymentMethodSetting>>("/metodos-pago", payload);
  return response.data.data;
}
