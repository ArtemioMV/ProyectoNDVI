import { ArrowDownCircle, ArrowUpCircle, CalendarCheck2, CalendarClock, CircleAlert, CircleCheck, ListOrdered, ReceiptText, RotateCcw, Search, TrendingDown, Wallet } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { TicketModal, type TicketData } from "@/components/documents/TicketDocument";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { IconAction } from "@/components/ui/IconAction";
import { cn } from "@/components/ui/cn";
import type { CashMovement, CashRegister } from "../types/cash-register.types";
import { money, tableDate } from "@/lib/format";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function timeOf(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function sourceLabel(source: CashMovement["source"]) {
  const labels = { PAYMENT: "Pago de cliente", SALE: "Venta", PURCHASE: "Compra", EXPENSE: "Gasto", MANUAL: "Manual" };
  return labels[source];
}

/** Segmento de la franja de KPIs (icono en circulo suave + etiqueta + valor). */
function KpiSegment({ icon, label, value, tone = "neutral" }: { icon: ReactNode; label: string; value: ReactNode; tone?: "neutral" | "success" | "danger" | "violet" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600"
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", tones[tone])}>{icon}</span>
      <div className="min-w-0">
        <span className="block truncate text-xs text-slate-500">{label}</span>
        <strong className="block truncate text-base">{value}</strong>
      </div>
    </div>
  );
}

/** Cabecera de la caja abierta: saldo esperado + KPIs del turno. */
export function CashStatusHeader({ cashRegister }: { cashRegister: CashRegister }) {
  const income = cashRegister.movements.filter((movement) => movement.type === "INCOME").reduce((sum, movement) => sum + movement.amount, 0);
  const expense = cashRegister.movements.filter((movement) => movement.type === "EXPENSE").reduce((sum, movement) => sum + movement.amount, 0);
  const negative = cashRegister.expectedAmount < 0;

  return (
    <section className="grid overflow-hidden rounded-xl border bg-background shadow-sm lg:grid-cols-[18rem_1fr]">
      <div className="border-b p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Caja abierta</span>
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Abierta</span>
        </div>
        <span className="mt-2 block text-xs text-slate-500">Saldo esperado</span>
        <strong className={cn("block text-3xl tracking-tight", negative ? "text-red-600" : "text-slate-900")}>{money(cashRegister.expectedAmount)}</strong>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarClock className="h-3.5 w-3.5" /> Inicio {dateTime(cashRegister.openedAt)}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 sm:divide-x xl:grid-cols-4">
        <KpiSegment icon={<Wallet className="h-4 w-4" />} label="Monto inicial" value={money(cashRegister.initialAmount)} />
        <KpiSegment icon={<ArrowUpCircle className="h-4 w-4" />} label="Ingresos" value={money(income)} tone="success" />
        <KpiSegment icon={<ArrowDownCircle className="h-4 w-4" />} label="Egresos" value={money(expense)} tone="danger" />
        <KpiSegment icon={<ListOrdered className="h-4 w-4" />} label="Movimientos" value={cashRegister.movements.length} tone="violet" />
      </div>
    </section>
  );
}

/** Tab Movimientos: tabla con buscador, filtro por tipo y ticket por movimiento. */
export function CashMovementList({ movements }: { movements: CashMovement[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | CashMovement["type"]>("");
  const [ticket, setTicket] = useState<TicketData | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return movements.filter((movement) => {
      if (typeFilter && movement.type !== typeFilter) return false;
      if (!term) return true;
      return [movement.description, sourceLabel(movement.source), movement.receiptCode].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    });
  }, [movements, search, typeFilter]);

  function openTicket(movement: CashMovement) {
    setTicket({
      code: movement.receiptCode ?? movement.id.slice(0, 8).toUpperCase(),
      title: movement.type === "INCOME" ? "Ticket ingreso de caja" : "Ticket egreso de caja",
      date: movement.createdAt,
      totalLabel: movement.type === "INCOME" ? "Total ingreso" : "Total egreso",
      meta: [{ label: "Origen", value: sourceLabel(movement.source) }],
      items: [{ label: movement.description, amount: movement.amount }],
      total: movement.amount
    });
  }

  const columns = useMemo<Array<DataTableColumn<CashMovement>>>(() => [
    {
      id: "description",
      header: "Movimiento",
      pinnedByDefault: true,
      minWidth: 240,
      cell: (movement) => (
        <div className="flex items-center gap-2.5">
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", movement.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
            {movement.type === "INCOME" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <strong className="block truncate">{movement.description}</strong>
            <span className="text-xs text-slate-500">{movement.receiptCode ?? sourceLabel(movement.source)}</span>
          </div>
        </div>
      )
    },
    { id: "source", header: "Origen", cell: (movement) => sourceLabel(movement.source) },
    { id: "date", header: "Fecha y hora", minWidth: 150, cell: (movement) => dateTime(movement.createdAt) },
    {
      id: "type",
      header: "Tipo",
      cell: (movement) => (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", movement.type === "INCOME" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
          {movement.type === "INCOME" ? "Ingreso" : "Egreso"}
        </span>
      )
    },
    {
      id: "amount",
      header: "Monto",
      className: "text-right font-semibold",
      headerClassName: "text-right",
      cell: (movement) => <span className={movement.type === "INCOME" ? "text-green-700" : "text-red-700"}>{movement.type === "INCOME" ? "+" : "-"}{money(movement.amount)}</span>
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (movement) => (
        <IconAction label="Ver ticket" icon={<ReceiptText />} tone="neutral" variant="outline" size="sm" onClick={() => openTicket(movement)} />
      )
    }
  ], []);

  return (
    <>
      <DataTable
        storageKey="novalink.cash.movements.table"
        title="Movimientos"
        description="Ingresos y egresos de la caja abierta: pagos, ventas, compras, gastos y manuales."
        data={filtered}
        columns={columns}
        getRowId={(movement) => movement.id}
        emptyMessage="La caja aun no tiene movimientos."
        minWidth={880}
        toolbar={
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-[16rem_10rem]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Buscar movimiento..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <FilterSelect aria-label="Tipo" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "" | CashMovement["type"])}>
              <option value="">Todos los tipos</option>
              <option value="INCOME">Ingresos</option>
              <option value="EXPENSE">Egresos</option>
            </FilterSelect>
          </div>
        }
      />
      <TicketModal ticket={ticket} onClose={() => setTicket(null)} />
    </>
  );
}

function closureState(cashRegister: CashRegister) {
  if (cashRegister.status === "OPEN") return { label: "Abierta", className: "bg-blue-50 text-blue-700" };
  if (cashRegister.difference && cashRegister.difference !== 0) return { label: "Con diferencia", className: "bg-red-50 text-red-700" };
  return { label: "Cerrada", className: "bg-green-50 text-green-700" };
}

/** Tab Cierres de caja: KPIs del historial + tabla de aperturas/cierres. */
export function CashClosuresPanel({ cashRegisters, onReopen, reopeningId }: { cashRegisters: CashRegister[]; onReopen?: (cashRegister: CashRegister) => void; reopeningId?: string | null }) {
  const closed = cashRegisters.filter((cashRegister) => cashRegister.status === "CLOSED");
  const withDifference = closed.filter((cashRegister) => cashRegister.difference && cashRegister.difference !== 0);
  const accumulated = withDifference.reduce((sum, cashRegister) => sum + (cashRegister.difference ?? 0), 0);

  const columns = useMemo<Array<DataTableColumn<CashRegister>>>(() => [
    {
      id: "date",
      header: "Fecha",
      pinnedByDefault: true,
      minWidth: 150,
      cell: (cashRegister) => (
        <strong className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" /> {tableDate(cashRegister.openedAt)}</strong>
      )
    },
    { id: "opened", header: "Apertura", cell: (cashRegister) => timeOf(cashRegister.openedAt) },
    { id: "closed", header: "Cierre", cell: (cashRegister) => timeOf(cashRegister.closedAt) },
    { id: "initial", header: "Monto inicial", cell: (cashRegister) => money(cashRegister.initialAmount) },
    { id: "expected", header: "Esperado", cell: (cashRegister) => money(cashRegister.expectedAmount) },
    { id: "counted", header: "Real", cell: (cashRegister) => (cashRegister.countedAmount === null ? "—" : money(cashRegister.countedAmount)) },
    {
      id: "difference",
      header: "Diferencia",
      className: "font-semibold",
      cell: (cashRegister) => {
        if (cashRegister.status === "OPEN") return <span className="font-normal text-slate-400">—</span>;
        const difference = cashRegister.difference ?? 0;
        return (
          <span className={difference === 0 ? "text-green-700" : difference > 0 ? "text-blue-700" : "text-red-700"}>
            {difference > 0 ? "+" : ""}{money(difference)}
          </span>
        );
      }
    },
    {
      id: "status",
      header: "Estado",
      cell: (cashRegister) => {
        const state = closureState(cashRegister);
        return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", state.className)}>{state.label}</span>;
      }
    },
    ...(onReopen
      ? [{
          id: "actions",
          header: "Acciones",
          cell: (cashRegister: CashRegister) => cashRegister.status === "CLOSED" ? (
            <IconAction
              label="Reabrir caja (correcciones)"
              icon={<RotateCcw />}
              tone="warning"
              variant="outline"
              size="sm"
              disabled={reopeningId === cashRegister.id}
              onClick={() => onReopen(cashRegister)}
            />
          ) : null
        }]
      : [])
  ], [onReopen, reopeningId]);

  return (
    <div className="space-y-4">
      <section className="grid overflow-hidden rounded-xl border bg-background shadow-sm sm:grid-cols-2 sm:divide-x xl:grid-cols-4">
        <KpiSegment icon={<CalendarCheck2 className="h-4 w-4" />} label="Cierres registrados" value={closed.length} />
        <KpiSegment icon={<CircleAlert className="h-4 w-4" />} label="Con diferencia" value={withDifference.length} tone="danger" />
        <KpiSegment icon={<CircleCheck className="h-4 w-4" />} label="Sin diferencia" value={closed.length - withDifference.length} tone="success" />
        <KpiSegment
          icon={<TrendingDown className="h-4 w-4" />}
          label="Diferencia acumulada"
          value={<span className={accumulated === 0 ? undefined : accumulated > 0 ? "text-blue-700" : "text-red-600"}>{accumulated > 0 ? "+" : ""}{money(accumulated)}</span>}
          tone="violet"
        />
      </section>

      <DataTable
        storageKey="novalink.cash.history.table"
        title="Cierres de caja"
        description="Historial diario de aperturas, cierres y diferencias contra lo esperado."
        data={cashRegisters}
        columns={columns}
        getRowId={(cashRegister) => cashRegister.id}
        emptyMessage="No hay cierres ni aperturas registradas."
        minWidth={980}
      />
    </div>
  );
}
