export type PaymentMethod = "CASH" | "YAPE" | "PLIN" | "TRANSFER" | "CARD" | "OTHER";
export type MonthlyFeeStatus = "PENDING" | "PARTIAL" | "PAID" | "VOID";

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: "VALID" | "VOID";
  receiptCode: string;
  notes?: string | null;
  paidAt: string;
};

export type MonthlyFee = {
  id: string;
  period: string;
  dueDate?: string | null;
  amount: number;
  paidAmount: number;
  balance: number;
  status: MonthlyFeeStatus;
  notes?: string | null;
  payments: Payment[];
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

export type CustomerPaymentHistory = {
  customer: {
    id: string;
    documentNumber: string;
    fullName: string;
    phone?: string | null;
    address?: string | null;
    district?: string | null;
  };
  totalDebt: number;
  fees: MonthlyFee[];
};

export type PaymentTicket = {
  id: string;
  receiptCode: string;
  paidAt: string;
  amount: number;
  method: PaymentMethod;
  status: "VALID" | "VOID";
  notes?: string | null;
  monthlyFee: Omit<MonthlyFee, "service">;
  customer: CustomerPaymentHistory["customer"];
  service: { id: string; plan: MonthlyFee["service"]["plan"] };
};

export type CustomerContract = {
  contractCode: string;
  generatedAt: string;
  customer: CustomerPaymentHistory["customer"];
  services: Array<{ id: string; screenCount?: number | null; installedAt?: string | null; plan: MonthlyFee["service"]["plan"] }>;
  monthlyTotal: number;
  clauses: string[];
};
