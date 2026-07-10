import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, TrendingUp, Users, WalletCards, Wifi } from "lucide-react";
import { MetricCard } from "@/components/ui/Panels";
import { fetchCurrentCashRegister } from "@/modules/caja/api/cash-register.api";
import { fetchCollections } from "@/modules/cobranza/api/collections.api";
import { httpClient } from "@/services/api/http-client";
import { money } from "@/lib/format";

type ApiResponse<T> = { success: boolean; data: T; message?: string };
type Customer = { status: "ACTIVE" | "SUSPENDED" | "CANCELLED"; services: Array<{ status: "ACTIVE" | "SUSPENDED" | "CANCELLED" }> };

async function fetchCustomers() {
  const response = await httpClient.get<ApiResponse<Customer[]>>("/customers");
  return response.data.data;
}


export function DashboardPage() {
  const customersQuery = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const collectionsQuery = useQuery({ queryKey: ["collections", "", "ALL", "", ""], queryFn: () => fetchCollections({}) });
  const cashQuery = useQuery({ queryKey: ["cash-register", "current"], queryFn: fetchCurrentCashRegister });

  const customers = customersQuery.data ?? [];
  const activeClients = customers.filter((customer) => customer.status === "ACTIVE").length;
  const activeServices = customers.reduce((sum, customer) => sum + customer.services.filter((service) => service.status === "ACTIVE").length, 0);

  const summary = collectionsQuery.data?.summary;
  const cash = cashQuery.data;
  const cashOpen = cash?.status === "OPEN";

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen operativo y financiero.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clientes activos" value={activeClients} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Servicios activos" value={activeServices} icon={<Wifi className="h-4 w-4" />} />
        <MetricCard label="Deuda pendiente" value={money(summary?.totalPending ?? 0)} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
        <MetricCard label="Cobrado este mes" value={money(summary?.paidThisMonth ?? 0)} icon={<TrendingUp className="h-4 w-4" />} tone="success" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Mensualidades pendientes" value={summary?.pendingCount ?? 0} icon={<CalendarClock className="h-4 w-4" />} />
        <MetricCard label="Vencidas" value={summary?.overdueCount ?? 0} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
        <MetricCard
          label={cashOpen ? "Caja del dia (esperado)" : "Caja"}
          value={cashOpen ? money(cash?.expectedAmount ?? 0) : "Cerrada"}
          icon={<WalletCards className="h-4 w-4" />}
          tone={cashOpen ? "success" : "neutral"}
        />
      </div>
    </section>
  );
}
