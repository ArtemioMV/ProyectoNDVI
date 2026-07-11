import { ArrowDownCircle, ArrowUpCircle, CalendarClock } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { IconAction } from "@/components/ui/IconAction";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import type { CashMovement, CashRegister } from "../types/cash-register.types";
import { money, tableDate } from "@/lib/format";


function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function sourceLabel(source: CashMovement["source"]) {
  const labels = { PAYMENT: "Pago", SALE: "Venta", PURCHASE: "Compra", EXPENSE: "Gasto", MANUAL: "Manual" };
  return labels[source];
}

const movementColumns: Array<DataTableColumn<CashMovement>> = [
  {
    id: "description",
    header: "Movimiento",
    pinnedByDefault: true,
    minWidth: 220,
    cell: (movement) => (
      <div className="flex gap-3">
        <span className={movement.type === "INCOME" ? "text-green-600" : "text-red-600"}>
          {movement.type === "INCOME" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
        </span>
        <div>
          <strong className="block">{movement.description}</strong>
          <span className="text-xs text-slate-500">{sourceLabel(movement.source)}</span>
        </div>
      </div>
    )
  },
  { id: "type", header: "Tipo", cell: (movement) => (movement.type === "INCOME" ? "Ingreso" : "Egreso") },
  { id: "source", header: "Origen", visibleByDefault: false, cell: (movement) => sourceLabel(movement.source) },
  { id: "date", header: "Fecha", cell: (movement) => tableDate(movement.createdAt) },
  {
    id: "amount",
    header: "Monto",
    className: "font-semibold",
    cell: (movement) => <span className={movement.type === "INCOME" ? "text-green-700" : "text-red-700"}>{movement.type === "INCOME" ? "+" : "-"}{money(movement.amount)}</span>
  }
];

const historyColumns: Array<DataTableColumn<CashRegister>> = [
  {
    id: "opened",
    header: "Apertura",
    pinnedByDefault: true,
    minWidth: 190,
    cell: (cashRegister) => (
      <strong className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> {tableDate(cashRegister.openedAt)}</strong>
    )
  },
  { id: "closed", header: "Cierre", cell: (cashRegister) => (cashRegister.closedAt ? tableDate(cashRegister.closedAt) : "Caja aun abierta") },
  { id: "initial", header: "Inicial", visibleByDefault: false, cell: (cashRegister) => money(cashRegister.initialAmount) },
  { id: "expected", header: "Esperado", cell: (cashRegister) => money(cashRegister.expectedAmount) },
  { id: "difference", header: "Diferencia", cell: (cashRegister) => money(cashRegister.difference ?? 0) },
  {
    id: "status",
    header: "Estado",
    cell: (cashRegister) => (
      <span className={cashRegister.status === "OPEN" ? "rounded-full bg-green-50 px-3 py-1 text-sm text-green-700" : "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"}>
        {cashRegister.status === "OPEN" ? "Abierta" : "Cerrada"}
      </span>
    )
  }
];

export function CashRegisterSummary({ cashRegister }: { cashRegister: CashRegister }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-col gap-2 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold">Caja abierta</h2>
          <p className="text-sm text-slate-500">Inicio {dateTime(cashRegister.openedAt)}</p>
        </div>
        <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">Abierta</span>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-3">
        <div>
          <span className="text-xs text-slate-500">Monto inicial</span>
          <strong className="block text-xl">{money(cashRegister.initialAmount)}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500">Esperado en caja</span>
          <strong className="block text-xl">{money(cashRegister.expectedAmount)}</strong>
        </div>
        <div>
          <span className="text-xs text-slate-500">Movimientos</span>
          <strong className="block text-xl">{cashRegister.movements.length}</strong>
        </div>
      </div>
    </section>
  );
}

export function CashMovementList({ movements }: { movements: CashMovement[] }) {
  return (
    <DataTable
      storageKey="novalink.cash.movements.table"
      title="Movimientos recientes"
      data={movements}
      columns={movementColumns}
      getRowId={(movement) => movement.id}
      emptyMessage="Aun no hay movimientos en esta caja."
      minWidth={760}
    />
  );
}

export function CashHistoryList({ cashRegisters, onReopen, reopeningId }: { cashRegisters: CashRegister[]; onReopen?: (cashRegister: CashRegister) => void; reopeningId?: string | null }) {
  const columns = onReopen
    ? [
        ...historyColumns,
        {
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
        }
      ]
    : historyColumns;

  return (
    <DataTable
      storageKey="novalink.cash.history.table"
      title="Historial de cajas"
      data={cashRegisters}
      columns={columns}
      getRowId={(cashRegister) => cashRegister.id}
      emptyMessage="No hay cierres ni aperturas registradas."
      minWidth={820}
    />
  );
}


