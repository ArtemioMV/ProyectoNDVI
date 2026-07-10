export function formatPaymentReceiptCode(sequence: number, date = new Date()) {
  return `T-${date.getFullYear()}-${String(sequence).padStart(6, "0")}`;
}

/** Prefijos de comprobante por operacion: T pagos, V ventas, C compras, G gastos, M mov. caja. */
export type ReceiptPrefix = "T" | "V" | "C" | "G" | "M";

export function formatReceiptCode(prefix: ReceiptPrefix, sequence: number, date = new Date()) {
  return `${prefix}-${date.getFullYear()}-${String(sequence).padStart(6, "0")}`;
}
