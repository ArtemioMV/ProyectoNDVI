export type ExpenseCategoryType = "OPERATING" | "PAYROLL" | "RENT" | "UTILITY" | "TAX" | "COMMISSION" | "TRANSPORT" | "OTHER";
export type ExpenseStatus = "VALID" | "VOID";
export type PaymentMethod = "CASH" | "YAPE" | "PLIN" | "TRANSFER" | "CARD" | "OTHER";

export type ExpenseCategory = {
  id: string;
  name: string;
  type: ExpenseCategoryType;
  description?: string | null;
  isActive: boolean;
};

export type Expense = {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidFromCash: boolean;
  reference?: string | null;
  notes?: string | null;
  receiptCode?: string | null;
  status: ExpenseStatus;
  expenseDate: string;
  createdAt: string;
  category: ExpenseCategory;
};

export type CreateExpenseCategoryPayload = {
  name: string;
  type?: ExpenseCategoryType;
  description?: string;
  isActive?: boolean;
};

export type CreateExpensePayload = {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paidFromCash?: boolean;
  reference?: string;
  notes?: string;
  expenseDate?: string;
};
