import type { Material } from "@/modules/productos/types/products.types";

export type PaymentMethod = "CASH" | "YAPE" | "PLIN" | "TRANSFER" | "CARD" | "OTHER";
export type PurchaseStatus = "REGISTERED" | "VOID";

export type Supplier = {
  id: string;
  name: string;
  documentNumber?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
  department?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  reference?: string | null;
  notes?: string | null;
  isActive: boolean;
};

export type MaterialPurchaseItem = {
  id: string;
  materialId?: string | null;
  description: string;
  quantity: number;
  quantityText?: string | null;
  unitCost: number;
  subtotal: number;
  material?: Material | null;
};

export type MaterialPurchase = {
  id: string;
  supplierId?: string | null;
  supplierName?: string | null;
  documentNumber?: string | null;
  receiptNumber?: string | null;
  paymentMethod: PaymentMethod;
  paidFromCash: boolean;
  notes?: string | null;
  totalAmount: number;
  receiptCode?: string | null;
  status: PurchaseStatus;
  purchasedAt: string;
  createdAt: string;
  supplier?: Supplier | null;
  items: MaterialPurchaseItem[];
};

export type CreateSupplierPayload = {
  name: string;
  documentNumber?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  country?: string;
  department?: string;
  province?: string;
  district?: string;
  address?: string;
  reference?: string;
  notes?: string;
  isActive?: boolean;
};

export type CreateMaterialPurchasePayload = {
  supplierId?: string;
  supplierName?: string;
  documentNumber?: string;
  receiptNumber?: string;
  paymentMethod?: PaymentMethod;
  paidFromCash?: boolean;
  notes?: string;
  purchasedAt?: string;
  items: Array<{
    materialId?: string;
    description: string;
    quantity: number;
    quantityText?: string;
    unitCost: number;
  }>;
};
