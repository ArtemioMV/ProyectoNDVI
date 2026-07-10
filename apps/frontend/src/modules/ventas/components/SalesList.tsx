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
import { voidMaterialSale } from "../api/sales.api";
import type { MaterialSale } from "../types/sales.types";
import { money } from "@/lib/format";

type SalesListProps = {
  sales: MaterialSale[];
  isLoading: boolean;
};

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function SalesList({ sales, isLoading }: SalesListProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [voidTarget, setVoidTarget] = useState<MaterialSale | null>(null);
  const [ticket, setTicket] = useState<TicketData | null>(null);

  function openTicket(sale: MaterialSale) {
    setTicket({
      code: sale.receiptCode ?? sale.id.slice(0, 8).toUpperCase(),
      title: "Ticket de venta",
      date: sale.createdAt,
      status: sale.status,
      meta: [
        { label: "Cliente", value: sale.customerName || "Venta mostrador" },
        ...(sale.documentNumber ? [{ label: "Documento", value: sale.documentNumber }] : []),
        { label: "Metodo", value: paymentMethodLabels[sale.paymentMethod] },
        ...(sale.discountAmount > 0 ? [{ label: "Descuento", value: money(sale.discountAmount) }] : [])
      ],
      items: sale.items.map((item) => ({
        label: item.material.name,
        detail: `${item.quantity} ${item.material.unit} x ${money(item.unitPrice)}`,
        amount: item.subtotal
      })),
      total: sale.totalAmount
    });
  }

  const voidMutation = useMutation({
    mutationFn: (sale: MaterialSale) => voidMaterialSale(sale.id),
    onSuccess: () => {
      toast({ tone: "success", message: "Venta anulada: stock repuesto y egreso registrado en caja." });
      setVoidTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["material-sales"] });
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo anular la venta. Revisa que haya caja abierta." })
  });

  const columns = useMemo<Array<DataTableColumn<MaterialSale>>>(() => [
    {
      id: "customer",
      header: "Cliente",
      pinnedByDefault: true,
      minWidth: 240,
      cell: (sale) => (
        <div>
          <strong className="block">{sale.customerName || "Venta mostrador"}</strong>
          <span className="text-xs text-slate-500">{sale.documentNumber ? `Doc. ${sale.documentNumber}` : "Sin documento"}</span>
        </div>
      )
    },
    { id: "date", header: "Fecha", cell: (sale) => dateTime(sale.createdAt) },
    {
      id: "items",
      header: "Items",
      minWidth: 260,
      cell: (sale) => (
        <div className="space-y-1">
          {sale.items.slice(0, 2).map((item) => (
            <p key={item.id} className="text-sm">
              {item.material.name} <span className="text-xs text-slate-500">({item.quantity} {item.material.unit})</span>
            </p>
          ))}
          {sale.items.length > 2 ? <p className="text-xs text-slate-500">+{sale.items.length - 2} item(es) mas</p> : null}
        </div>
      )
    },
    { id: "method", header: "Metodo", cell: (sale) => paymentMethodLabels[sale.paymentMethod] },
    { id: "discount", header: "Descuento", visibleByDefault: false, cell: (sale) => money(sale.discountAmount) },
    { id: "total", header: "Total", className: "font-semibold", cell: (sale) => money(sale.totalAmount) },
    { id: "status", header: "Estado", cell: (sale) => <DocumentStatusBadge status={sale.status} /> },
    { id: "receipt", header: "Ticket", cell: (sale) => sale.receiptCode || "-" },
    { id: "notes", header: "Notas", visibleByDefault: false, minWidth: 240, cell: (sale) => sale.notes || "-" },
    {
      id: "actions",
      header: "Acciones",
      cell: (sale) => (
        <div className="flex gap-1.5">
          <IconAction label="Ver ticket" icon={<ReceiptText />} tone="neutral" variant="outline" size="sm" onClick={() => openTicket(sale)} />
          {sale.status !== "VOID" ? (
            <IconAction label="Anular venta" icon={<Ban />} tone="danger" variant="outline" size="sm" onClick={() => setVoidTarget(sale)} />
          ) : null}
        </div>
      )
    }
  ], []);

  return (
    <>
      <DataTable
        storageKey="novalink.sales.table"
        title="Ultimas ventas"
        description="Detalle de ventas registradas, caja y materiales entregados."
        data={sales}
        columns={columns}
        getRowId={(sale) => sale.id}
        isLoading={isLoading}
        emptyMessage="No hay ventas registradas."
        minWidth={980}
      />

      <AppModal
        open={voidTarget !== null}
        size="sm"
        title="Anular venta"
        description={voidTarget ? `${voidTarget.customerName || "Venta mostrador"} · ${money(voidTarget.totalAmount)}` : undefined}
        onClose={() => setVoidTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={voidMutation.isPending} onClick={() => setVoidTarget(null)}>Volver</Button>
            <Button type="button" variant="danger" disabled={voidMutation.isPending} onClick={() => voidTarget && voidMutation.mutate(voidTarget)}>
              {voidMutation.isPending ? "Anulando..." : "Anular venta"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Se repondra el stock de los materiales vendidos y se registrara un egreso en caja por el total cobrado. Requiere caja abierta. Esta accion no se puede deshacer.
        </p>
      </AppModal>

      <TicketModal ticket={ticket} onClose={() => setTicket(null)} />
    </>
  );
}
