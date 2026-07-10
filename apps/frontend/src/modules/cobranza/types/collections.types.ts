import type { MonthlyFeeStatus, PaymentMethod } from "@/modules/pagos/types/payments.types";

export type CollectionItem = {
  id: string;
  period: string;
  dueDate?: string | null;
  amount: number;
  paidAmount: number;
  balance: number;
  status: MonthlyFeeStatus;
  notes?: string | null;
  lastPaymentAt?: string | null;
  customer: {
    id: string;
    fullName: string;
    documentNumber: string;
    phone?: string | null;
    address?: string | null;
    district?: string | null;
    status: string;
  };
  service: {
    id: string;
    status: string;
    screenCount?: number | null;
    plan: {
      id: string;
      type: "INTERNET" | "TV";
      name: string;
      monthlyPrice: number;
      downloadMbps?: number | null;
      uploadMbps?: number | null;
      maxScreens?: number | null;
    };
  };
};

export type CollectionsSummary = {
  totalPending: number;
  pendingCount: number;
  overdueCount: number;
  partialCount: number;
  paidThisMonth: number;
};

export type CollectionsResponse = {
  summary: CollectionsSummary;
  items: CollectionItem[];
};

export type CollectionStatusFilter = "ALL" | MonthlyFeeStatus;
export type { PaymentMethod };
