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

export type InventoryReport = {
  products: number;
  units: number;
  costValue: number;
  saleValue: number;
  lowStock: Array<{ id: string; name: string; sku?: string | null; stock: number; minStock: number; unit: string }>;
};

export type CashClosure = {
  id: string;
  openedAt: string;
  closedAt?: string | null;
  initialAmount: number;
  expectedAmount: number;
  countedAmount?: number | null;
  difference?: number | null;
};

export async function fetchInventoryReport() {
  const response = await httpClient.get<ApiResponse<InventoryReport>>("/reportes/inventario");
  return response.data.data;
}

export async function fetchCashClosures() {
  const response = await httpClient.get<ApiResponse<CashClosure[]>>("/reportes/caja");
  return response.data.data;
}

export type ProfitReport = {
  year: number;
  partners: Array<{ id: string; name: string; sharePercent: number }>;
  rows: Array<{ month: number; income: number; outflow: number; net: number; margin: number; shares: Array<{ partnerId: string; amount: number }> }>;
  totals: { income: number; outflow: number; net: number; margin: number; shares: Array<{ partnerId: string; amount: number }> };
};

export async function fetchProfitReport(year?: number) {
  const response = await httpClient.get<ApiResponse<ProfitReport>>("/reportes/ganancias", {
    params: year ? { year } : undefined
  });
  return response.data.data;
}
