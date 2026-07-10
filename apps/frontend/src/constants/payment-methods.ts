export type PaymentMethodKey = "CASH" | "YAPE" | "PLIN" | "TRANSFER" | "CARD" | "OTHER";

export type PaymentMethodConfig = {
  value: PaymentMethodKey;
  label: string;
  description: string;
  evidence: boolean;
  active: boolean;
  order: number;
};

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { value: "CASH", label: "Efectivo", description: "Pago en caja.", evidence: false, active: true, order: 10 },
  { value: "YAPE", label: "Yape", description: "Billetera Yape.", evidence: true, active: true, order: 20 },
  { value: "PLIN", label: "Plin", description: "Billetera Plin.", evidence: true, active: true, order: 30 },
  { value: "TRANSFER", label: "Transferencia", description: "Deposito o transferencia.", evidence: true, active: true, order: 40 },
  { value: "CARD", label: "Tarjeta", description: "POS o tarjeta.", evidence: true, active: true, order: 50 },
  { value: "OTHER", label: "Otro", description: "Otro metodo.", evidence: true, active: true, order: 60 }
];

export function activePaymentMethods() {
  return PAYMENT_METHODS.filter((method) => method.active).sort((a, b) => a.order - b.order);
}

export const paymentMethodLabels: Record<PaymentMethodKey, string> = PAYMENT_METHODS.reduce(
  (labels, method) => ({ ...labels, [method.value]: method.label }),
  {} as Record<PaymentMethodKey, string>
);

export function paymentMethodOptions() {
  return activePaymentMethods().map(({ value, label, description }) => ({ value, label, description }));
}
