import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Eye, RefreshCcw, Search, WalletCards } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { emptyPayments, paidTotal, paymentEvidences, PaymentSplit, type PaymentsState, primaryMethod } from "@/components/pos/PaymentSplit";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { IconAction } from "@/components/ui/IconAction";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { TextareaField } from "@/components/ui/FormControls";
import { fetchCollections } from "../api/collections.api";
import type { CollectionItem, CollectionStatusFilter } from "../types/collections.types";
import { registerPayment } from "@/modules/pagos/api/payments.api";
import type { PaymentTicket } from "@/modules/pagos/types/payments.types";
import { money } from "@/lib/format";

const statusLabels = {
  ALL: "Todos",
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  VOID: "Anulado"
};


function dateText(value?: string | null) {
  if (!value) return "Sin vencimiento";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short" }).format(new Date(value));
}


function statusBadge(status: CollectionItem["status"]) {
  const styles = {
    PENDING: "bg-yellow-50 text-yellow-700",
    PARTIAL: "bg-blue-50 text-blue-700",
    PAID: "bg-green-50 text-green-700",
    VOID: "bg-slate-100 text-slate-600"
  };
  return <span className={["rounded-full px-2 py-0.5 text-xs font-medium", styles[status]].join(" ")}>{statusLabels[status]}</span>;
}

function TicketBox({ ticket }: { ticket: PaymentTicket }) {
  return (
    <div className="rounded-lg border bg-background p-4 text-sm">
      <strong className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Ticket {ticket.receiptCode}</strong>
      <p className="mt-2">Cliente: {ticket.customer.fullName}</p>
      <p>Periodo: {ticket.monthlyFee.period} - {ticket.service.plan.name}</p>
      <p>Importe: {money(ticket.amount)}</p>
      <p>Saldo: {money(ticket.monthlyFee.balance)}</p>
    </div>
  );
}

export function CobranzaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [status, setStatus] = useState<CollectionStatusFilter>("ALL");
  const [payItem, setPayItem] = useState<CollectionItem | null>(null);
  const [payments, setPayments] = useState<PaymentsState>(emptyPayments);
  const [notes, setNotes] = useState("");
  const [ticket, setTicket] = useState<PaymentTicket | null>(null);

  const collectionsQuery = useQuery({
    queryKey: ["collections", search, status, dateRange.from, dateRange.to],
    queryFn: () => fetchCollections({ search, status, dateFrom: dateRange.from, dateTo: dateRange.to })
  });

  const paymentMutation = useMutation({
    mutationFn: () => registerPayment({ monthlyFeeId: payItem!.id, amount: paidTotal(payments), method: primaryMethod(payments), notes: notes || undefined, evidences: paymentEvidences(payments) }),
    onSuccess: (createdTicket) => {
      setTicket(createdTicket);
      setPayItem(null);
      setPayments(emptyPayments);
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-payment-history"] });
    }
  });

  const columns = useMemo<Array<DataTableColumn<CollectionItem>>>(() => [
    {
      id: "customer",
      header: "Cliente",
      pinnedByDefault: true,
      minWidth: 220,
      cell: (item) => (
        <div>
          <strong className="block">{item.customer.fullName}</strong>
          <span className="text-xs text-slate-500">Doc. {item.customer.documentNumber} - {item.customer.phone || "sin telefono"}</span>
        </div>
      )
    },
    { id: "period", header: "Periodo", cell: (item) => item.period },
    { id: "service", header: "Servicio", minWidth: 190, cell: (item) => item.service.plan.name },
    { id: "due", header: "Vence", cell: (item) => dateText(item.dueDate) },
    { id: "amount", header: "Monto", cell: (item) => money(item.amount) },
    { id: "paid", header: "Pagado", visibleByDefault: false, cell: (item) => money(item.paidAmount) },
    { id: "balance", header: "Saldo", className: "font-semibold text-red-700", cell: (item) => money(item.balance) },
    { id: "status", header: "Estado", cell: (item) => statusBadge(item.status) },
    { id: "district", header: "Ubicacion", visibleByDefault: false, cell: (item) => item.customer.district || "-" },
    {
      id: "actions",
      header: "Acciones",
      cell: (item) => (
        <div className="flex gap-1.5">
          <IconAction
            label="Cobrar mensualidad"
            icon={<CreditCard />}
            tone="primary"
            variant="outline"
            size="sm"
            disabled={item.balance <= 0 || item.status === "VOID"}
            onClick={() => { setPayItem(item); setPayments({ ...emptyPayments, CASH: { enabled: true, amount: item.balance } }); }}
          />
          <IconAction label="Ver ficha de pagos" icon={<Eye />} tone="success" variant="outline" size="sm" onClick={() => navigate(`/clientes/${item.customer.id}/pagos`)} />
        </div>
      )
    }
  ], [navigate]);

  function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payItem || paidTotal(payments) <= 0) return;
    paymentMutation.mutate();
  }

  const summary = collectionsQuery.data?.summary;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mensualidades</h1>
          <p className="text-sm text-slate-500">Control de mensualidades, saldos pendientes, vencimientos y pagos de clientes.</p>
        </div>
        <Button variant="secondary" icon={<RefreshCcw className="h-4 w-4" />} onClick={() => void collectionsQuery.refetch()}>
          Actualizar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Pendiente total</span>
          <strong className="block text-xl text-red-700">{money(summary?.totalPending ?? 0)}</strong>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Pendientes</span>
          <strong className="block text-xl">{summary?.pendingCount ?? 0}</strong>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Vencidos</span>
          <strong className="block text-xl text-yellow-700">{summary?.overdueCount ?? 0}</strong>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <span className="text-xs text-slate-500">Cobrado este mes</span>
          <strong className="block text-xl text-green-700">{money(summary?.paidThisMonth ?? 0)}</strong>
        </div>
      </div>

      <DataTable
        storageKey="novalink.collections.table"
        title="Mensualidades para cobrar"
        description="Filtra por cliente, rango de fecha y estado. La tabla conserva tu vista de columnas."
        data={collectionsQuery.data?.items ?? []}
        columns={columns}
        getRowId={(item) => item.id}
        isLoading={collectionsQuery.isLoading}
        emptyMessage="No hay mensualidades para mostrar."
        minWidth={980}
        toolbar={
          <div className="grid w-full gap-2 sm:w-auto xl:grid-cols-[18rem_25rem_10rem]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Cliente, DNI o telefono" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <FilterSelect value={status} onChange={(event) => setStatus(event.target.value as CollectionStatusFilter)}>
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="PARTIAL">Parcial</option>
              <option value="PAID">Pagado</option>
              <option value="VOID">Anulado</option>
            </FilterSelect>
          </div>
        }
      />

      <AppModal open={Boolean(payItem)} title="Cobrar mensualidad" description={payItem ? `${payItem.customer.fullName} - ${payItem.period}` : undefined} onClose={() => setPayItem(null)} size="lg">
        {payItem ? (
          <form className="space-y-4" onSubmit={submitPayment}>
            <div className="rounded-md border bg-muted p-3 text-sm">
              <strong>{payItem.service.plan.name}</strong>
              <p>Saldo pendiente: {money(payItem.balance)}</p>
            </div>
            <PaymentSplit payments={payments} onChange={setPayments} total={payItem.balance} />
            <TextareaField label="Nota" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <div className="flex justify-end">
              <Button disabled={paymentMutation.isPending} icon={<WalletCards className="h-4 w-4" />} type="submit">Registrar cobro</Button>
            </div>
          </form>
        ) : null}
      </AppModal>

      <AppModal open={Boolean(ticket)} title="Cobro registrado" description="Ticket generado por el sistema." size="sm" onClose={() => setTicket(null)}>
        {ticket ? <TicketBox ticket={ticket} /> : null}
      </AppModal>
    </section>
  );
}













