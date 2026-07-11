import { httpClient } from "@/services/api/http-client";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export type ReportSummary = {
  range: { from: string; to: string };
  collected: number;
  collectedByMethod: Array<{ method: string; amount: number }>;
  paymentsCount: number;
  salesTotal: number;
  salesCount: number;
  purchasesTotal: number;
  purchasesCount: number;
  expensesTotal: number;
  expensesCount: number;
  net: number;
  debtTotal: number;
  debtorsCount: number;
  overdueCount: number;
  topDebtors: Array<{ customerId: string; fullName: string; documentNumber: string; phone: string | null; debt: number; overdue: boolean }>;
  customersByStatus: Record<string, number>;
};

export type MonthlyPoint = { month: string; income: number; outflow: number };

export async function fetchReportSummary(params: { from?: string; to?: string }) {
  const response = await httpClient.get<ApiResponse<ReportSummary>>("/reportes/resumen", {
    params: { from: params.from || undefined, to: params.to || undefined }
  });
  return response.data.data;
}

export async function fetchMonthlySeries() {
  const response = await httpClient.get<ApiResponse<MonthlyPoint[]>>("/reportes/mensual");
  return response.data.data;
}
