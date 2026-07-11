import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, CreditCard, Eye, FileMinus2, FileSpreadsheet, HandCoins, PauseCircle, ShoppingBag, ShoppingCart, TrendingUp, UserRound, Users, Wallet, XCircle } from "lucide-react";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { DataLoader } from "@/components/ui/DataLoader";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { IconAction } from "@/components/ui/IconAction";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/Toast";
import { paymentMethodLabels, type PaymentMethodKey } from "@/constants/payment-methods";
import { fetchCashClosures, fetchInventoryReport, fetchMonthlySeries, fetchProfitReport, fetchReportSummary } from "../api/reports.api";
import { DonutChart, FlowChart, FLOW_COLORS, METHOD_COLORS, Sparkline } from "../components/report-charts";
import { exportToExcel, type ExcelSheet } from "@/lib/excel";
import { money, tableDate } from "@/lib/format";

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

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

type KpiCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  color: string;
  spark?: number[];
};

function KpiCard({ label, value, hint, icon, color, spark }: KpiCardProps) {
  return (
    <article className="rounded-xl border bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium" style={{ color }}>
        <span className="grid h-7 w-7 place-items-center rounded-md" style={{ backgroundColor: `${color}14` }}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <strong className="block truncate text-2xl tracking-tight">{value}</strong>
          <span className="text-xs text-slate-500">{hint}</span>
        </div>
        {spark ? <Sparkline values={spark} color={color} /> : null}
      </div>
    </article>
  );
}

function CarteraStat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string | number; tone?: "danger" | "neutral" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-slate-500">{icon}</span>
      <div className="min-w-0">
        <span className="block truncate text-xs text-slate-500">{label}</span>
        <strong className={cn("block text-sm", tone === "danger" ? "text-red-700" : "text-slate-800")}>{value}</strong>
      </div>
    </div>
  );
}

export function ReportesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [range, setRange] = useState({ from: firstDayOfMonth(), to: today() });

  const summaryQuery = useQuery({ queryKey: ["report-summary", range.from, range.to], queryFn: () => fetchReportSummary(range) });
  const seriesQuery = useQuery({ queryKey: ["report-monthly"], queryFn: fetchMonthlySeries });
  const inventoryQuery = useQuery({ queryKey: ["report-inventory"], queryFn: fetchInventoryReport });
  const closuresQuery = useQuery({ queryKey: ["report-cash-closures"], queryFn: fetchCashClosures });
  const profitQuery = useQuery({ queryKey: ["report-profit"], queryFn: () => fetchProfitReport() });

  const summary = summaryQuery.data;
  const series = seriesQuery.data ?? [];
  const methodSegments = (summary?.collectedByMethod ?? [])
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .map((entry) => ({
      key: entry.method,
      label: paymentMethodLabels[entry.method as PaymentMethodKey] ?? entry.method,
      amount: entry.amount,
      color: METHOD_COLORS[entry.method] ?? METHOD_COLORS.OTHER
    }));

  function handleExport() {
    if (!summary) return;
    const profit = profitQuery.data;
    const sheets: ExcelSheet[] = [
      {
        name: "Resumen",
        rows: [
          { Concepto: "Rango", Valor: `${range.from} a ${range.to}` },
          { Concepto: "Cobrado (mensualidades)", Valor: summary.collected },
          { Concepto: "Ventas", Valor: summary.salesTotal },
          { Concepto: "Compras", Valor: summary.purchasesTotal },
          { Concepto: "Gastos", Valor: summary.expensesTotal },
          { Concepto: "Resultado neto", Valor: summary.net },
          { Concepto: "Deuda pendiente total", Valor: summary.debtTotal },
          { Concepto: "Clientes con deuda", Valor: summary.debtorsCount },
          { Concepto: "Cuotas vencidas", Valor: summary.overdueCount }
        ]
      },
      {
        name: "Cobrado por metodo",
        rows: methodSegments.map((segment) => ({ Metodo: segment.label, Monto: segment.amount, "%": summary.collected > 0 ? Number(((segment.amount / summary.collected) * 100).toFixed(1)) : 0 }))
      },
      {
        name: "Flujo mensual",
        rows: series.map((point) => ({
          Mes: monthLabel(point.month),
          Cobrado: point.collected,
          Ventas: point.sales,
          Compras: point.purchases,
          Gastos: point.expenses,
          Ingresos: point.income,
          Egresos: point.outflow,
          Neto: point.income - point.outflow
        }))
      },
      {
        name: "Top deudores",
        rows: summary.topDebtors.map((debtor) => ({ Cliente: debtor.fullName, DNI: debtor.documentNumber, Telefono: debtor.phone ?? "-", Estado: debtor.overdue ? "Moroso" : "Con deuda", Deuda: debtor.debt }))
      }
    ];
    if (profit) {
      sheets.push({
        name: `Ganancias ${profit.year}`,
        rows: [
          ...profit.rows.map((row) => ({
            Mes: monthNames[row.month - 1],
            Ingreso: row.income,
            Salida: row.outflow,
            Neto: row.net,
            "Margen %": Number((row.margin * 100).toFixed(1)),
            ...Object.fromEntries(row.shares.map((share) => [profit.partners.find((partner) => partner.id === share.partnerId)?.name ?? "Socio", share.amount]))
          })),
          {
            Mes: "TOTAL",
            Ingreso: profit.totals.income,
            Salida: profit.totals.outflow,
            Neto: profit.totals.net,
            "Margen %": Number((profit.totals.margin * 100).toFixed(1)),
            ...Object.fromEntries(profit.totals.shares.map((share) => [profit.partners.find((partner) => partner.id === share.partnerId)?.name ?? "Socio", share.amount]))
          }
        ]
      });
    }
    if (inventoryQuery.data) {
      sheets.push({
        name: "Inventario",
        rows: [
          { Concepto: "Productos activos", Valor: inventoryQuery.data.products },
          { Concepto: "Unidades en stock", Valor: inventoryQuery.data.units },
          { Concepto: "Valor a costo", Valor: inventoryQuery.data.costValue },
          { Concepto: "Valor a venta", Valor: inventoryQuery.data.saleValue },
          ...inventoryQuery.data.lowStock.map((item) => ({ Concepto: `STOCK BAJO: ${item.name}`, Valor: `${item.stock} / min ${item.minStock}` }))
        ]
      });
    }
    if (closuresQuery.data && closuresQuery.data.length > 0) {
      sheets.push({
        name: "Cierres de caja",
        rows: closuresQuery.data.map((closure) => ({
          Cierre: closure.closedAt ? tableDate(closure.closedAt) : "-",
          Inicial: closure.initialAmount,
          Esperado: closure.expectedAmount,
          Contado: closure.countedAmount ?? "-",
          Diferencia: closure.difference ?? "-"
        }))
      });
    }
    exportToExcel(`reportes-novalink-${today()}`, sheets);
    toast({ tone: "success", message: "Excel generado y descargado." });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reportes</h1>
          <p className="text-sm text-slate-500">Resumen financiero, cobranza y deuda por rango de fechas.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangeFilter value={range} onChange={setRange} className="sm:w-80" />
          <Button type="button" variant="secondary" icon={<FileSpreadsheet className="h-4 w-4" />} disabled={!summary} onClick={handleExport}>
            Exportar Excel
          </Button>
        </div>
      </div>

      {summaryQuery.isLoading ? <DataLoader label="Calculando reportes..." className="rounded-lg border bg-background" /> : null}

      {summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Cobrado (mensualidades)" value={money(summary.collected)} hint={`${summary.paymentsCount} pago(s)`} icon={<Wallet className="h-4 w-4" />} color="#059669" spark={series.map((point) => point.collected)} />
            <KpiCard label="Ventas" value={money(summary.salesTotal)} hint={`${summary.salesCount} venta(s)`} icon={<ShoppingCart className="h-4 w-4" />} color="#2563eb" spark={series.map((point) => point.sales)} />
            <KpiCard label="Compras" value={money(summary.purchasesTotal)} hint={`${summary.purchasesCount} compra(s)`} icon={<ShoppingBag className="h-4 w-4" />} color="#d97706" spark={series.map((point) => point.purchases)} />
            <KpiCard label="Gastos" value={money(summary.expensesTotal)} hint={`${summary.expensesCount} gasto(s)`} icon={<FileMinus2 className="h-4 w-4" />} color="#dc2626" spark={series.map((point) => point.expenses)} />
            <KpiCard label="Resultado neto" value={money(summary.net)} hint="Cobrado + ventas - compras - gastos" icon={<TrendingUp className="h-4 w-4" />} color="#7c3aed" spark={series.map((point) => point.income - point.outflow)} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="min-w-0 space-y-5">
              {/* Flujo financiero */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">Flujo financiero del periodo</h2>
                  <span className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FLOW_COLORS.income }} /> Ingresos (S/)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FLOW_COLORS.outflow }} /> Egresos (S/)</span>
                  </span>
                </div>
                {seriesQuery.isLoading ? <DataLoader label="Cargando serie..." className="min-h-24" /> : null}
                {series.length > 0 ? <FlowChart points={series.map((point) => ({ label: monthLabel(point.month), income: point.income, outflow: point.outflow }))} /> : null}
              </section>

              {/* Ganancias por socio */}
              <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
                  <h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" /> Ganancias por socio · {profitQuery.data?.year ?? new Date().getFullYear()}</h2>
                  <span className="text-sm text-slate-500">
                    {profitQuery.data && profitQuery.data.partners.length > 0
                      ? profitQuery.data.partners.map((partner) => `${partner.name} ${partner.sharePercent.toFixed(0)}%`).join(" · ")
                      : "Registra socios en Configuracion para ver el reparto"}
                  </span>
                </div>
                {profitQuery.data ? (
                  <div className="scrollbar-thin overflow-x-auto">
                    <table className="w-full text-sm" style={{ minWidth: 640 }}>
                      <thead className="bg-table-head text-left text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Mes</th>
                          <th className="px-4 py-3 text-right font-semibold">Ingreso</th>
                          <th className="px-4 py-3 text-right font-semibold">Salida</th>
                          <th className="px-4 py-3 text-right font-semibold">Neto</th>
                          <th className="px-4 py-3 text-right font-semibold">Margen</th>
                          {profitQuery.data.partners.map((partner) => (
                            <th key={partner.id} className="px-4 py-3 text-right font-semibold">{partner.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {profitQuery.data.rows.filter((row) => row.income > 0 || row.outflow > 0).map((row) => (
                          <tr key={row.month} className="transition-colors hover:bg-primary/[0.025]">
                            <td className="px-4 py-2.5 font-medium">{monthNames[row.month - 1]}</td>
                            <td className="px-4 py-2.5 text-right">{money(row.income)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{money(row.outflow)}</td>
                            <td className={cn("px-4 py-2.5 text-right font-semibold", row.net >= 0 ? "text-emerald-700" : "text-red-700")}>{money(row.net)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{(row.margin * 100).toFixed(1)}%</td>
                            {row.shares.map((share) => (
                              <td key={share.partnerId} className="px-4 py-2.5 text-right">{money(share.amount)}</td>
                            ))}
                          </tr>
                        ))}
                        {profitQuery.data.rows.every((row) => row.income === 0 && row.outflow === 0) ? (
                          <tr><td colSpan={5 + profitQuery.data.partners.length} className="px-4 py-4 text-sm text-slate-500">Sin movimientos este anio.</td></tr>
                        ) : null}
                      </tbody>
                      <tfoot className="border-t bg-muted/40 font-semibold">
                        <tr>
                          <td className="px-4 py-3">TOTAL</td>
                          <td className="px-4 py-3 text-right">{money(profitQuery.data.totals.income)}</td>
                          <td className="px-4 py-3 text-right">{money(profitQuery.data.totals.outflow)}</td>
                          <td className={cn("px-4 py-3 text-right", profitQuery.data.totals.net >= 0 ? "text-emerald-700" : "text-red-700")}>{money(profitQuery.data.totals.net)}</td>
                          <td className="px-4 py-3 text-right">{(profitQuery.data.totals.margin * 100).toFixed(1)}%</td>
                          {profitQuery.data.totals.shares.map((share) => (
                            <td key={share.partnerId} className="px-4 py-3 text-right">{money(share.amount)}</td>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : <DataLoader label="Calculando ganancias..." className="min-h-24" />}
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
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(debtor.fullName)}</span>
                              <div className="min-w-0">
                                <strong className="block truncate">{debtor.fullName}</strong>
                                <span className="text-xs text-slate-500">DNI {debtor.documentNumber}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">{debtor.phone || "-"}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", debtor.overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                              {debtor.overdue ? "Moroso" : "Con deuda"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-red-700">{money(debtor.debt)}</td>
                          <td className="px-4 py-2.5">
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
                <button type="button" className="block w-full cursor-pointer border-t px-4 py-2.5 text-center text-sm font-medium text-primary transition hover:bg-primary/5" onClick={() => navigate("/cobranza")}>
                  Ver todos los deudores →
                </button>
              </section>
            </div>

            <aside className="space-y-5">
              {/* Cobrado por metodo: donut */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> Cobrado por metodo</h2>
                {methodSegments.length === 0 ? <p className="text-sm text-slate-500">Sin cobros en el rango.</p> : (
                  <div className="flex items-center gap-4">
                    <DonutChart segments={methodSegments} centerLabel="Total" centerValue={money(summary.collected)} />
                    <div className="min-w-0 flex-1 space-y-2">
                      {methodSegments.map((segment) => (
                        <div key={segment.key} className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} />
                            <span className="truncate">{segment.label}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <strong>{money(segment.amount)}</strong>
                            <span className="w-10 text-right text-xs text-slate-500">{summary.collected > 0 ? ((segment.amount / summary.collected) * 100).toFixed(1) : "0.0"}%</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Estado de cartera */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold"><HandCoins className="h-4 w-4 text-primary" /> Estado de cartera</h2>
                <div className="grid grid-cols-2 gap-3">
                  <CarteraStat icon={<AlertTriangle className="h-4 w-4" />} label="Deuda pendiente total" value={money(summary.debtTotal)} tone="danger" />
                  <CarteraStat icon={<UserRound className="h-4 w-4" />} label="Clientes activos" value={summary.customersByStatus.ACTIVE ?? 0} />
                  <CarteraStat icon={<PauseCircle className="h-4 w-4" />} label="Suspendidos" value={summary.customersByStatus.SUSPENDED ?? 0} />
                  <CarteraStat icon={<XCircle className="h-4 w-4" />} label="Cancelados" value={summary.customersByStatus.CANCELLED ?? 0} />
                  <CarteraStat icon={<AlertTriangle className="h-4 w-4" />} label="Cuotas vencidas" value={summary.overdueCount} tone="danger" />
                  <CarteraStat icon={<Users className="h-4 w-4" />} label="Con deuda" value={summary.debtorsCount} />
                </div>
              </section>

              {/* Inventario */}
              <section className="rounded-xl border bg-background p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold"><Boxes className="h-4 w-4 text-primary" /> Inventario</h2>
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
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock bajo</span>
                      {inventoryQuery.data.lowStock.length === 0 ? <span className="text-xs text-emerald-700">Sin alertas de stock ✓</span> : null}
                    </div>
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
                <h2 className="mb-3 flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> Ultimos cierres de caja</h2>
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
