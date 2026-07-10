export type PaymentMethod = "CASH" | "YAPE" | "PLIN" | "TRANSFER" | "CARD" | "OTHER";
export type MaterialSaleStatus = "VALID" | "VOID";

export type Material = {
  id: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  unit: string;
  costPrice?: number | null;
  salePrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  isLowStock: boolean;
};

export type MaterialSaleItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  material: Material;
};

export type MaterialSale = {
  id: string;
  customerName?: string | null;
  documentNumber?: string | null;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  discountAmount: number;
  totalAmount: number;
  receiptCode?: string | null;
  status: MaterialSaleStatus;
  createdAt: string;
  items: MaterialSaleItem[];
};

export type CreateMaterialSalePayload = {
  customerName?: string;
  documentNumber?: string;
  paymentMethod?: PaymentMethod;
  discountAmount?: number;
  notes?: string;
  items: Array<{ materialId: string; quantity: number }>;
};
