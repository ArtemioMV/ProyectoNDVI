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
import { voidMaterialPurchase } from "../api/purchases.api";
import type { MaterialPurchase } from "../types/purchases.types";
import { money } from "@/lib/format";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function PurchasesList({ purchases, isLoading }: { purchases: MaterialPurchase[]; isLoading: boolean }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [voidTarget, setVoidTarget] = useState<MaterialPurchase | null>(null);
  const [ticket, setTicket] = useState<TicketData | null>(null);

  function openTicket(purchase: MaterialPurchase) {
    setTicket({
      code: purchase.receiptCode ?? purchase.id.slice(0, 8).toUpperCase(),
      title: "Ticket de compra",
      date: purchase.purchasedAt,
      status: purchase.status === "VOID" ? "VOID" : "VALID",
      totalLabel: "Total pagado",
      meta: [
        { label: "Proveedor", value: purchase.supplier?.name || purchase.supplierName || "Sin proveedor" },
        ...(purchase.receiptNumber ? [{ label: "Comprobante prov.", value: purchase.receiptNumber }] : []),
        { label: "Metodo", value: paymentMethodLabels[purchase.paymentMethod] },
        { label: "Caja", value: purchase.paidFromCash ? "Egreso de caja" : "Fuera de caja" }
      ],
      items: purchase.items.map((item) => ({
        label: item.description,
        detail: `${item.quantityText || `${item.quantity} und`} x ${money(item.unitCost)}`,
        amount: item.subtotal
      })),
      total: purchase.totalAmount
    });
  }

  const voidMutation = useMutation({
    mutationFn: (purchase: MaterialPurchase) => voidMaterialPurchase(purchase.id),
    onSuccess: () => {
      toast({ tone: "success", message: "Compra anulada: stock retirado y efectivo devuelto a caja si aplicaba." });
      setVoidTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["material-purchases"] });
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo anular. Verifica caja abierta y que el stock comprado no este consumido." })
  });

  const columns = useMemo<Array<DataTableColumn<MaterialPurchase>>>(() => [
    {
      id: "supplier",
      header: "Proveedor",
      pinnedByDefault: true,
      minWidth: 240,
      cell: (purchase) => (
        <div>
          <strong className="block">{purchase.supplier?.name || purchase.supplierName || "Compra sin proveedor"}</strong>
          <span className="text-xs text-slate-500">{purchase.documentNumber ? `Doc. ${purchase.documentNumber}` : "Sin documento"}</span>
        </div>
      )
    },
    { id: "date", header: "Fecha", cell: (purchase) => dateTime(purchase.purchasedAt) },
    { id: "receipt", header: "Comprobante", cell: (purchase) => purchase.receiptNumber || "-" },
    {
      id: "items",
      header: "Items",
      minWidth: 260,
      cell: (purchase) => (
        <div className="space-y-1">
          {purchase.items.slice(0, 2).map((item) => (
            <p key={item.id} className="text-sm">
              {item.description} <span className="text-xs text-slate-500">({item.quantityText || `${item.quantity} und`})</span>
            </p>
          ))}
          {purchase.items.length > 2 ? <p className="text-xs text-slate-500">+{purchase.items.length - 2} item(es) mas</p> : null}
        </div>
      )
    },
    { id: "payment", header: "Pago", cell: (purchase) => paymentMethodLabels[purchase.paymentMethod] },
    { id: "cash", header: "Caja", cell: (purchase) => (purchase.paidFromCash ? "Egreso de caja" : "Sin caja") },
    { id: "total", header: "Total", className: "font-semibold", cell: (purchase) => money(purchase.totalAmount) },
    { id: "status", header: "Estado", cell: (purchase) => <DocumentStatusBadge status={purchase.status} /> },
    { id: "receipt-code", header: "Ticket", cell: (purchase) => purchase.receiptCode || "-" },
    { id: "notes", header: "Notas", visibleByDefault: false, minWidth: 240, cell: (purchase) => purchase.notes || "-" },
    {
      id: "actions",
      header: "Acciones",
      cell: (purchase) => (
        <div className="flex gap-1.5">
          <IconAction label="Ver ticket" icon={<ReceiptText />} tone="neutral" variant="outline" size="sm" onClick={() => openTicket(purchase)} />
          {purchase.status !== "VOID" ? (
            <IconAction label="Anular compra" icon={<Ban />} tone="danger" variant="outline" size="sm" onClick={() => setVoidTarget(purchase)} />
          ) : null}
        </div>
      )
    }
  ], []);

  return (
    <>
      <DataTable
        storageKey="novalink.purchases.table"
        title="Ultimas compras"
        description="Compras de materiales, gastos de stock y comprobantes."
        data={purchases}
        columns={columns}
        getRowId={(purchase) => purchase.id}
        isLoading={isLoading}
        emptyMessage="No hay compras registradas."
        minWidth={1100}
      />

      <AppModal
        open={voidTarget !== null}
        size="sm"
        title="Anular compra"
        description={voidTarget ? `${voidTarget.supplier?.name || voidTarget.supplierName || "Sin proveedor"} · ${money(voidTarget.totalAmount)}` : undefined}
        onClose={() => setVoidTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={voidMutation.isPending} onClick={() => setVoidTarget(null)}>Volver</Button>
            <Button type="button" variant="danger" disabled={voidMutation.isPending} onClick={() => voidTarget && voidMutation.mutate(voidTarget)}>
              {voidMutation.isPending ? "Anulando..." : "Anular compra"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Se retirara del inventario el stock ingresado por esta compra y, si se pago desde caja, se devolvera el efectivo. No se puede anular si el stock comprado ya fue consumido.
        </p>
      </AppModal>

      <TicketModal ticket={ticket} onClose={() => setTicket(null)} />
    </>
  );
}
