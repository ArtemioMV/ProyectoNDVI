import { httpClient } from "@/services/api/http-client";
import type { CustomerContract, CustomerPaymentHistory, PaymentMethod, PaymentTicket } from "../types/payments.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

type PaymentEvidencePayload = {
  fileName: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
};

export async function fetchCustomerPaymentHistory(customerId: string) {
  const response = await httpClient.get<ApiResponse<CustomerPaymentHistory>>(`/clientes/${customerId}/historial-pagos`);
  return response.data.data;
}

export async function generateMonthlyFees(customerId: string, payload: { period: string; dueDate?: string; notes?: string }) {
  const response = await httpClient.post<ApiResponse<unknown>>(`/clientes/${customerId}/mensualidades/generar`, payload);
  return response.data.data;
}

export async function registerPayment(payload: { monthlyFeeId: string; amount: number; method: PaymentMethod; notes?: string; evidences?: PaymentEvidencePayload[] }) {
  const response = await httpClient.post<ApiResponse<PaymentTicket>>("/pagos", payload);
  return response.data.data;
}

export async function fetchPaymentTicket(paymentId: string) {
  const response = await httpClient.get<ApiResponse<PaymentTicket>>(`/pagos/${paymentId}/ticket`);
  return response.data.data;
}

export async function fetchCustomerContract(customerId: string) {
  const response = await httpClient.get<ApiResponse<CustomerContract>>(`/clientes/${customerId}/contrato`);
  return response.data.data;
}

export async function voidPayment(paymentId: string, payload: { reason?: string } = {}) {
  const response = await httpClient.patch<ApiResponse<PaymentTicket>>(`/pagos/${paymentId}/anular`, payload);
  return response.data.data;
}
