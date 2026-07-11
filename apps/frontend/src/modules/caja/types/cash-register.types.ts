export type CashRegisterStatus = "OPEN" | "CLOSED";
export type CashMovementType = "INCOME" | "EXPENSE";
export type CashMovementSource = "PAYMENT" | "SALE" | "PURCHASE" | "EXPENSE" | "MANUAL";

export type CashMovement = {
  id: string;
  cashRegisterId: string;
  type: CashMovementType;
  source: CashMovementSource;
  referenceId: string | null;
  receiptCode?: string | null;
  amount: number;
  description: string;
  createdAt: string;
};

export type CashRegister = {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  expectedAmount: number;
  countedAmount: number | null;
  difference: number | null;
  status: CashRegisterStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  movements: CashMovement[];
};

export type OpenCashRegisterPayload = {
  initialAmount: number;
  notes?: string;
};

export type CloseCashRegisterPayload = {
  countedAmount: number;
  notes?: string;
};

export type CreateCashMovementPayload = {
  type: CashMovementType;
  amount: number;
  description: string;
  referenceId?: string;
};

