import { cn } from "./cn";

/**
 * Capsula de estado del cliente, compartida por tablas, fichas y mapa.
 * Antes cada modulo definia su propio `statusBadge`; esta es la fuente unica.
 */
export type CustomerStatusValue = "ACTIVE" | "SUSPENDED" | "CANCELLED";

const styles: Record<CustomerStatusValue, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  SUSPENDED: "bg-yellow-50 text-yellow-700",
  CANCELLED: "bg-slate-100 text-slate-600"
};

const labels: Record<CustomerStatusValue, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  CANCELLED: "Cancelado"
};

export function CustomerStatusBadge({ status, className }: { status: CustomerStatusValue; className?: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles[status], className)}>{labels[status]}</span>;
}

/** Capsula para documentos anulables (ventas, compras, gastos). */
export type DocumentStatusValue = "VALID" | "REGISTERED" | "VOID";

export function DocumentStatusBadge({ status, className }: { status: DocumentStatusValue; className?: string }) {
  const isVoid = status === "VOID";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", isVoid ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-700", className)}>
      {isVoid ? "Anulado" : "Valido"}
    </span>
  );
}
