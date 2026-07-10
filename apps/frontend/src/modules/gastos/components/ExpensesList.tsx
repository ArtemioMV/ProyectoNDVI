import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { TicketModal, type TicketData } from "@/components/documents/TicketDocument";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { IconAction } from "@/components/ui/IconAction";
import { DocumentStatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { paymentMethodLabels } from "@/constants/payment-methods";
import { voidExpense } from "../api/expenses.api";
import type { Expense, ExpenseCategoryType } from "../types/expenses.types";
import { money } from "@/lib/format";

const categoryTypeLabels: Record<ExpenseCategoryType, string> = {
  OPERATING: "Operativo",
  PAYROLL: "Planilla",
  RENT: "Alquiler",
  UTILITY: "Servicios",
  TAX: "Impuestos",
  COMMISSION: "Comision",
  TRANSPORT: "Movilidad",
  OTHER: "Otros"
};

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function ExpensesList({ expenses, isLoading }: { expenses: Expense[]; isLoading: boolean }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [voidTarget, setVoidTarget] = useState<Expense | null>(null);
  const [ticket, setTicket] = useState<TicketData | null>(null);

  function openTicket(expense: Expense) {
    setTicket({
      code: expense.receiptCode ?? expense.id.slice(0, 8).toUpperCase(),
      title: "Ticket de gasto",
      date: expense.expenseDate,
      status: expense.status,
      totalLabel: "Total gasto",
      meta: [
        { label: "Categoria", value: `${expense.category.name} (${categoryTypeLabels[expense.category.type]})` },
        { label: "Metodo", value: paymentMethodLabels[expense.paymentMethod] },
        { label: "Caja", value: expense.paidFromCash ? "Egreso de caja" : "Fuera de caja" },
        ...(expense.reference ? [{ label: "Referencia", value: expense.reference }] : [])
      ],
      items: [{ label: expense.description, amount: expense.amount }],
      total: expense.amount
    });
  }

  const voidMutation = useMutation({
    mutationFn: (expense: Expense) => voidExpense(expense.id),
    onSuccess: () => {
      toast({ tone: "success", message: "Gasto anulado: el efectivo volvio a caja si aplicaba." });
      setVoidTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo anular el gasto. Revisa que haya caja abierta." })
  });

  const columns = useMemo<Array<DataTableColumn<Expense>>>(() => [
    {
      id: "description",
      header: "Gasto",
      pinnedByDefault: true,
      minWidth: 260,
      cell: (expense) => (
        <div>
          <strong className="block">{expense.description}</strong>
          <span className="text-xs text-slate-500">{expense.reference || "Sin referencia"}</span>
        </div>
      )
    },
    { id: "category", header: "Categoria", cell: (expense) => expense.category.name },
    { id: "type", header: "Tipo", cell: (expense) => categoryTypeLabels[expense.category.type] },
    { id: "date", header: "Fecha", cell: (expense) => dateTime(expense.expenseDate) },
    { id: "method", header: "Metodo", cell: (expense) => paymentMethodLabels[expense.paymentMethod] },
    { id: "cash", header: "Caja", cell: (expense) => (expense.paidFromCash ? "Egreso de caja" : "Fuera de caja") },
    { id: "amount", header: "Monto", className: "font-semibold text-red-700", cell: (expense) => `-${money(expense.amount)}` },
    { id: "status", header: "Estado", cell: (expense) => <DocumentStatusBadge status={expense.status} /> },
    { id: "receipt", header: "Ticket", cell: (expense) => expense.receiptCode || "-" },
    { id: "notes", header: "Notas", visibleByDefault: false, minWidth: 240, cell: (expense) => expense.notes || "-" },
    {
      id: "actions",
      header: "Acciones",
      cell: (expense) => (
        <div className="flex gap-1.5">
          <IconAction label="Ver ticket" icon={<ReceiptText />} tone="neutral" variant="outline" size="sm" onClick={() => openTicket(expense)} />
          {expense.status !== "VOID" ? (
            <IconAction label="Anular gasto" icon={<Ban />} tone="danger" variant="outline" size="sm" onClick={() => setVoidTarget(expense)} />
          ) : null}
        </div>
      )
    }
  ], []);

  return (
    <>
      <DataTable
        storageKey="novalink.expenses.table"
        title="Historial de gastos"
        description="Salidas operativas que afectan caja y utilidad, sin mover inventario."
        data={expenses}
        columns={columns}
        getRowId={(expense) => expense.id}
        isLoading={isLoading}
        emptyMessage="No hay gastos registrados."
        minWidth={1040}
      />

      <AppModal
        open={voidTarget !== null}
        size="sm"
        title="Anular gasto"
        description={voidTarget ? `${voidTarget.description} · ${money(voidTarget.amount)}` : undefined}
        onClose={() => setVoidTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={voidMutation.isPending} onClick={() => setVoidTarget(null)}>Volver</Button>
            <Button type="button" variant="danger" disabled={voidMutation.isPending} onClick={() => voidTarget && voidMutation.mutate(voidTarget)}>
              {voidMutation.isPending ? "Anulando..." : "Anular gasto"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Si el gasto salio de caja, el efectivo se devolvera como ingreso. Esta accion no se puede deshacer.
        </p>
      </AppModal>

      <TicketModal ticket={ticket} onClose={() => setTicket(null)} />
    </>
  );
}
