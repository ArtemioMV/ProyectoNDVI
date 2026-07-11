import { useQuery } from "@tanstack/react-query";
import { CreditCard, Eye, FileMinus2, HandCoins, ShoppingBag, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { DataLoader } from "@/components/ui/DataLoader";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { IconAction } from "@/components/ui/IconAction";
import { MetricCard } from "@/components/ui/Panels";
import { cn } from "@/components/ui/cn";
import { paymentMethodLabels, type PaymentMethodKey } from "@/constants/payment-methods";
import { fetchCashClosures, fetchInventoryReport, fetchMonthlySeries, fetchReportSummary } from "../api/reports.api";
import { money } from "@/lib/format";

function firstDayOfMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  return new Date().toLocaleDateString("en-CA");
}

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${monthNames[Number(month) - 1]} ${year.slice(2)}`;
}

export function ReportesPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState({ from: firstDayOfMonth(), to: today() });

  const summaryQuery = useQuery({
    queryKey: ["report-summary", range.from, range.to],
    queryFn: () => fetchReportSummary(range)
  });
  const seriesQuery = useQuery({ queryKey: ["report-monthly"], queryFn: fetchMonthlySeries });
  const inventoryQuery = useQuery({ queryKey: ["report-inventory"], queryFn: fetchInventoryReport });
  const closuresQuery = useQuery({ queryKey: ["report-cash-closures"], queryFn: fetchCashClosures });

  const summary = summaryQuery.data;
  const series = seriesQuery.data ?? [];
  const seriesMax = Math.max(1, ...series.flatMap((point) => [point.income, point.outflow]));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reportes</h1>
          <p className="text-sm text-slate-500">Resultado financiero, cobranza y deuda por rango de fechas.</p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} className="lg:w-96" />
      </div>

      {summaryQuery.isLoading ? <DataLoader label="Calculando reportes..." className="rounded-lg border bg-background" /> : null}

      {summary ? (
        <>
          {/* KPIs del rango */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Cobrado (mensualidades)" value={money(summary.collected)} icon={<HandCoins className="h-4 w-4" />} tone="success" hint={`${summary.paymentsCount} pago(s)`} />
            <MetricCard label="Ventas" value={money(summary.salesTotal)} icon={<ShoppingCart className="h-4 w-4" />} tone="success" hint={`${summary.salesCount} venta(s)`} />
            <MetricCard label="Compras" value={money(summary.purchasesTotal)} icon={<ShoppingBag className="h-4 w-4" />} tone="warning" hint={`${summary.purchasesCount} compra(s)`} />
            <MetricCard label="Gastos" value={money(summary.expensesTotal)} icon={<FileMinus2 className="h-4 w-4" />} tone="warning" hint={`${summary.expensesCount} gasto(s)`} />
            <MetricCard label="Resultado del rango" value={money(summary.net)} icon={<TrendingUp className="h-4 w-4" />} tone={summary.net >= 0 ? "success" : "warning"} hint="Cobrado + ventas - compras - gastos" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
            <div className="space-y-5">
              {/* Serie mensual: barras simples sin dependencias */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Ingresos vs salidas (6 meses)</h2>
                  <span className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Ingresos</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Salidas</span>
                  </span>
                </div>
                {seriesQuery.isLoading ? <DataLoader label="Cargando serie..." className="min-h-24" /> : null}
                <div className="grid grid-cols-6 items-end gap-3" style={{ minHeight: "11rem" }}>
                  {series.map((point) => (
                    <div key={point.month} className="flex flex-col items-center gap-1.5">
                      <div className="flex h-36 w-full items-end justify-center gap-1.5">
                        <div
                          className="w-4 rounded-t bg-primary transition-all"
                          title={`Ingresos ${monthLabel(point.month)}: ${money(point.income)}`}
                          style={{ height: `${Math.max(2, (point.income / seriesMax) * 100)}%` }}
                        />
                        <div
                          className="w-4 rounded-t bg-amber-400 transition-all"
                          title={`Salidas ${monthLabel(point.month)}: ${money(point.outflow)}`}
                          style={{ height: `${Math.max(2, (point.outflow / seriesMax) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{monthLabel(point.month)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top deudores */}
              <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="font-semibold">Top deudores</h2>
                  <span className="text-sm text-slate-500">{summary.debtorsCount} cliente(s) con deuda · {summary.overdueCount} cuota(s) vencida(s)</span>
                </div>
                {summary.topDebtors.length === 0 ? <p className="p-4 text-sm text-slate-500">Nadie debe. Todos al dia.</p> : (
                  <table className="w-full text-sm">
                    <thead className="bg-table-head text-left text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Cliente</th>
                        <th className="px-4 py-3 font-semibold">Telefono</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 text-right font-semibold">Deuda</th>
                        <th className="px-4 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {summary.topDebtors.map((debtor) => (
                        <tr key={debtor.customerId} className="transition-colors hover:bg-primary/[0.025]">
                          <td className="px-4 py-3">
                            <strong className="block">{debtor.fullName}</strong>
                            <span className="text-xs text-slate-500">DNI {debtor.documentNumber}</span>
                          </td>
                          <td className="px-4 py-3">{debtor.phone || "-"}</td>
                          <td className="px-4 py-3">
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", debtor.overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                              {debtor.overdue ? "Moroso" : "Con deuda"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-700">{money(debtor.debt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <IconAction label="Cobrar" icon={<CreditCard />} tone="primary" variant="outline" size="sm" onClick={() => navigate(`/clientes/${debtor.customerId}/pagos`)} />
                              <IconAction label="Ver ficha" icon={<Eye />} tone="success" variant="outline" size="sm" onClick={() => navigate(`/clientes/${debtor.customerId}`)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>

            <aside className="space-y-5">
              {/* Cobrado por metodo */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> Cobrado por metodo</h2>
                <div className="space-y-2">
                  {summary.collectedByMethod.length === 0 ? <p className="text-sm text-slate-500">Sin cobros en el rango.</p> : null}
                  {summary.collectedByMethod
                    .sort((a, b) => b.amount - a.amount)
                    .map((entry) => (
                      <div key={entry.method} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{paymentMethodLabels[entry.method as PaymentMethodKey] ?? entry.method}</span>
                          <strong>{money(entry.amount)}</strong>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${summary.collected > 0 ? (entry.amount / summary.collected) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              {/* Deuda y clientes */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 font-semibold">Cartera</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-slate-500">Deuda pendiente total</span>
                    <strong className="text-red-700">{money(summary.debtTotal)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Clientes activos</span>
                    <strong>{summary.customersByStatus.ACTIVE ?? 0}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Suspendidos</span>
                    <strong>{summary.customersByStatus.SUSPENDED ?? 0}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cancelados</span>
                    <strong>{summary.customersByStatus.CANCELLED ?? 0}</strong>
                  </div>
                </div>
              </section>
              {/* Inventario valorizado */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 font-semibold">Inventario</h2>
                {inventoryQuery.data ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Productos activos</span>
                      <strong>{inventoryQuery.data.products}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Unidades en stock</span>
                      <strong>{inventoryQuery.data.units}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Valor a costo</span>
                      <strong>{money(inventoryQuery.data.costValue)}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-slate-500">Valor a venta</span>
                      <strong>{money(inventoryQuery.data.saleValue)}</strong>
                    </div>
                    <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Stock bajo</p>
                    {inventoryQuery.data.lowStock.length === 0 ? <p className="text-xs text-slate-500">Sin alertas de stock.</p> : null}
                    {inventoryQuery.data.lowStock.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-red-50/60 px-2 py-1 text-xs">
                        <span className="min-w-0 truncate text-slate-700">{item.name}</span>
                        <span className="shrink-0 font-semibold text-red-700">{item.stock} / min {item.minStock}</span>
                      </div>
                    ))}
                  </div>
                ) : <DataLoader label="Cargando inventario..." className="min-h-20" />}
              </section>

              {/* Cierres de caja */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 font-semibold">Ultimos cierres de caja</h2>
                {closuresQuery.data ? (
                  <div className="space-y-1.5 text-sm">
                    {closuresQuery.data.length === 0 ? <p className="text-sm text-slate-500">Aun no hay cierres registrados.</p> : null}
                    {closuresQuery.data.map((closure) => (
                      <div key={closure.id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5">
                        <span className="text-xs text-slate-600">
                          {closure.closedAt ? new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(closure.closedAt)) : "-"}
                        </span>
                        <span className="flex items-center gap-2">
                          <strong className="text-xs">{closure.countedAmount === null || closure.countedAmount === undefined ? "-" : money(closure.countedAmount)}</strong>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", !closure.difference ? "bg-emerald-100 text-emerald-700" : closure.difference > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>
                            {!closure.difference ? "Cuadre exacto" : `${closure.difference > 0 ? "+" : ""}${money(closure.difference)}`}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <DataLoader label="Cargando cierres..." className="min-h-20" />}
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
