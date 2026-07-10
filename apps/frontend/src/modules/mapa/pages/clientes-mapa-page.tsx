import { useQuery } from "@tanstack/react-query";
import { BarChart3, CreditCard, Eye, FileText, Maximize2, Minimize2, Tv, RotateCcw, Search, Wifi, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { IconAction } from "@/components/ui/IconAction";
import { DataLoader } from "@/components/ui/DataLoader";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { cn } from "@/components/ui/cn";
import { CustomerPointsMap, type CustomerPointTone } from "@/components/map/LocationMap";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CustomerStatusBadge } from "@/components/ui/StatusBadge";
import { fetchCollections } from "@/modules/cobranza/api/collections.api";
import { httpClient } from "@/services/api/http-client";
import { money } from "@/lib/format";

type PlanType = "INTERNET" | "TV";
type Status = "ACTIVE" | "SUSPENDED" | "CANCELLED";
type ApiResponse<T> = { success: boolean; data: T; message?: string };

type ServicePlan = {
  id: string;
  type: PlanType;
  name: string;
  monthlyPrice: number;
  downloadMbps?: number | null;
  uploadMbps?: number | null;
  maxScreens?: number | null;
};

type CustomerService = {
  id: string;
  status: Status;
  plan: ServicePlan;
};

type Customer = {
  id: string;
  fullName: string;
  documentNumber: string;
  phone?: string | null;
  email?: string | null;
  department?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  reference?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status: Status;
  services: CustomerService[];
};

type CustomerPoint = {
  id: string;
  name: string;
  zone: string;
  monthly: number;
  lat: string | number | null | undefined;
  lng: string | number | null | undefined;
  services: string;
  documentNumber: string;
  phone?: string | null;
  statusLabel: string;
  debt: number;
  tone: CustomerPointTone;
};

async function fetchCustomers() {
  const response = await httpClient.get<ApiResponse<Customer[]>>("/customers");
  return response.data.data;
}


function planDetail(plan: ServicePlan) {
  if (plan.type === "INTERNET") return `${plan.downloadMbps ?? 0} Mbps`;
  return `${plan.maxScreens ?? 1} pantalla${(plan.maxScreens ?? 1) > 1 ? "s" : ""}`;
}

function zoneName(customer: Customer) {
  return customer.district || customer.province || customer.department || "Sin zona";
}

function statusLabel(status: Status) {
  const labels: Record<Status, string> = { ACTIVE: "Activo", SUSPENDED: "Suspendido", CANCELLED: "Cancelado" };
  return labels[status];
}

function uniqueActiveServices(customer: Customer, planId: string, serviceType: "" | PlanType) {
  const servicesByType = new Map<PlanType, CustomerService>();
  customer.services
    .filter((service) => service.status === "ACTIVE")
    .filter((service) => !planId || service.plan.id === planId)
    .filter((service) => !serviceType || service.plan.type === serviceType)
    .forEach((service) => {
      if (!servicesByType.has(service.plan.type)) servicesByType.set(service.plan.type, service);
    });
  return [servicesByType.get("INTERNET"), servicesByType.get("TV")].filter(Boolean) as CustomerService[];
}

function hasPoint(customer: Customer) {
  return Boolean(customer.latitude && customer.longitude);
}

function serviceText(services: CustomerService[]) {
  return services.map((service) => `${service.plan.type === "INTERNET" ? "Internet" : "IPTV"}: ${planDetail(service.plan)}`).join(" | ") || "Sin servicios";
}

/** Numero peruano a formato wa.me: solo digitos y prefijo 51 si es celular local. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `51${digits}` : digits;
}

export function ClientesMapaPage() {
  const navigate = useNavigate();
  const customersQuery = useQuery({ queryKey: ["customers-map"], queryFn: fetchCustomers });
  const collectionsQuery = useQuery({ queryKey: ["collections-map"], queryFn: () => fetchCollections({}) });
  const [planId, setPlanId] = useState("");
  const [serviceType, setServiceType] = useState<"" | PlanType>("");
  const [status, setStatus] = useState<"" | Status>("");
  const [zone, setZone] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const customers = customersQuery.data ?? [];

  // Deuda agregada por cliente desde cobranza: suma de saldos y si hay cuota vencida.
  const debtByCustomer = useMemo(() => {
    const map = new Map<string, { debt: number; overdue: boolean }>();
    const now = new Date();
    (collectionsQuery.data?.items ?? []).forEach((item) => {
      if (item.balance <= 0) return;
      const entry = map.get(item.customer.id) ?? { debt: 0, overdue: false };
      entry.debt += item.balance;
      if (item.dueDate && new Date(item.dueDate) < now) entry.overdue = true;
      map.set(item.customer.id, entry);
    });
    return map;
  }, [collectionsQuery.data]);

  const plans = useMemo(() => {
    const map = new Map<string, ServicePlan>();
    customers.forEach((customer) => customer.services.filter((service) => service.status === "ACTIVE").forEach((service) => map.set(service.plan.id, service.plan)));
    return Array.from(map.values()).sort((a, b) => `${a.type}-${a.name}`.localeCompare(`${b.type}-${b.name}`));
  }, [customers]);

  const baseRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return customers
      .filter((customer) => !status || customer.status === status)
      .filter((customer) => {
        if (!normalizedSearch) return true;
        return [customer.fullName, customer.documentNumber, customer.phone, customer.address, customer.district].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch));
      })
      .map((customer) => {
        const services = uniqueActiveServices(customer, planId, serviceType);
        const monthly = services.reduce((sum, service) => sum + service.plan.monthlyPrice, 0);
        return { customer, services, monthly, zone: zoneName(customer) };
      })
      .filter((row) => row.services.length > 0 || (!planId && !serviceType));
  }, [customers, planId, search, serviceType, status]);

  const zones = useMemo(() => Array.from(new Set(baseRows.map((row) => row.zone))).sort(), [baseRows]);
  const visibleRows = useMemo(() => baseRows.filter((row) => !zone || row.zone === zone), [baseRows, zone]);

  const points = useMemo<CustomerPoint[]>(() => visibleRows
    .filter((row) => hasPoint(row.customer))
    .map((row) => {
      const debtEntry = debtByCustomer.get(row.customer.id);
      const tone: CustomerPointTone = row.customer.status !== "ACTIVE"
        ? "inactive"
        : debtEntry
          ? (debtEntry.overdue ? "overdue" : "debt")
          : "ok";
      return {
        id: row.customer.id,
        name: row.customer.fullName,
        zone: row.zone,
        monthly: row.monthly,
        lat: row.customer.latitude,
        lng: row.customer.longitude,
        services: serviceText(row.services),
        documentNumber: row.customer.documentNumber,
        phone: row.customer.phone,
        statusLabel: statusLabel(row.customer.status),
        debt: debtEntry?.debt ?? 0,
        tone
      };
    }), [visibleRows, debtByCustomer]);

  const withCoords = visibleRows.filter((row) => hasPoint(row.customer)).length;
  const withoutCoords = visibleRows.length - withCoords;
  const totalMonthly = visibleRows.reduce((sum, row) => sum + row.monthly, 0);
  const internetCount = visibleRows.filter((row) => row.services.some((service) => service.plan.type === "INTERNET")).length;
  const tvCount = visibleRows.filter((row) => row.services.some((service) => service.plan.type === "TV")).length;
  const activeCount = visibleRows.filter((row) => row.customer.status === "ACTIVE").length;
  const suspendedCount = visibleRows.filter((row) => row.customer.status === "SUSPENDED").length;
  const cancelledCount = visibleRows.filter((row) => row.customer.status === "CANCELLED").length;
  const topZones = useMemo(() => Array.from(
    visibleRows.reduce((map, row) => map.set(row.zone, (map.get(row.zone) ?? 0) + 1), new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 3), [visibleRows]);
  const locatedRatio = visibleRows.length > 0 ? Math.round((withCoords / visibleRows.length) * 100) : 0;
  const activeRatio = visibleRows.length > 0 ? Math.round((activeCount / visibleRows.length) * 100) : 0;

  const selectedRow = useMemo(
    () => visibleRows.find((row) => row.customer.id === selectedPointId) ?? null,
    [visibleRows, selectedPointId]
  );
  const selectedDebt = selectedRow ? debtByCustomer.get(selectedRow.customer.id) : undefined;

  function clearFilters() {
    setPlanId("");
    setServiceType("");
    setStatus("");
    setZone("");
    setSearch("");
    setSelectedPointId(null);
  }

  if (customersQuery.isLoading) return <DataLoader label="Cargando mapa de clientes..." />;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mapa de clientes</h1>
          <p className="mt-1 text-sm text-slate-500">Ubicacion de clientes, servicios activos y estado de cobranza.</p>
        </div>
      </div>

      <div className="grid gap-2 rounded-lg border bg-background p-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1.4fr_auto]">
        <FilterSelect aria-label="Servicio" value={serviceType} onChange={(event) => { setServiceType(event.target.value as "" | PlanType); setPlanId(""); }}>
          <option value="">Internet y TV</option>
          <option value="INTERNET">Internet</option>
          <option value="TV">TV / IPTV</option>
        </FilterSelect>
        <FilterSelect aria-label="Estado" value={status} onChange={(event) => setStatus(event.target.value as "" | Status)}>
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="SUSPENDED">Suspendidos</option>
          <option value="CANCELLED">Cancelados</option>
        </FilterSelect>
        <FilterSelect aria-label="Zona" value={zone} onChange={(event) => setZone(event.target.value)}>
          <option value="">Todas las zonas</option>
          {zones.map((item) => <option key={item} value={item}>{item}</option>)}
        </FilterSelect>
        <FilterSelect aria-label="Plan" value={planId} onChange={(event) => { setPlanId(event.target.value); setZone(""); }}>
          <option value="">Todos los planes</option>
          {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.type} - {plan.name}</option>)}
        </FilterSelect>
        <span className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Cliente, DNI, telefono..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </span>
        <IconAction label="Limpiar filtros" icon={<RotateCcw />} tone="primary" variant="soft" size="sm" onClick={clearFilters} />
      </div>

      <div className={cn("grid gap-3", expanded ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_20.5rem]") }>
        <div className={cn("relative overflow-hidden rounded-lg border bg-background", expanded ? "h-[calc(100dvh-14rem)] min-h-[28rem]" : "h-[clamp(32rem,calc(100dvh-18rem),44rem)]")}>
          <CustomerPointsMap points={points} selectedPointId={selectedPointId} onPointClick={(point) => setSelectedPointId(point.id)} className={cn("h-full w-full border-0", expanded ? "h-[calc(100dvh-14rem)] min-h-[28rem]" : "h-[clamp(32rem,calc(100dvh-18rem),44rem)]")} />
          <div className="absolute left-3 top-3 rounded-md border bg-white/95 p-3 text-xs shadow-sm">
            <p className="mb-2 font-medium text-slate-700">Estado de cobranza</p>
            <div className="space-y-1.5 text-slate-600">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Al dia</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Con deuda</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Moroso (cuota vencida)</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Suspendido / cancelado</span>
            </div>
          </div>
          <IconAction label={expanded ? "Contraer mapa" : "Ampliar mapa"} icon={expanded ? <Minimize2 /> : <Maximize2 />} tone="primary" variant="solid" size="sm" className="absolute bottom-14 right-3 bg-white shadow-md ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setExpanded((value) => !value)} />
        </div>

        {!expanded && selectedRow ? (
          <aside className="h-[clamp(32rem,calc(100dvh-18rem),44rem)] overflow-hidden rounded-lg border bg-background">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-800">{selectedRow.customer.fullName}</h2>
                <p className="text-xs text-slate-500">DNI {selectedRow.customer.documentNumber} · {selectedRow.zone}</p>
              </div>
              <IconAction label="Volver al resumen" icon={<X />} tone="neutral" variant="soft" size="sm" onClick={() => setSelectedPointId(null)} />
            </div>

            <div className="h-[calc(100%-4.2rem)] space-y-2 overflow-y-auto p-2.5 scrollbar-thin">
              <section className="grid grid-cols-4 gap-1.5">
                <IconAction label="Cobrar / registrar pago" icon={<CreditCard />} tone="primary" variant="solid" className="w-full" wrapperClassName="w-full" onClick={() => navigate(`/clientes/${selectedRow.customer.id}/pagos`)} />
                <IconAction label="Ver ficha del cliente" icon={<Eye />} tone="success" variant="solid" className="w-full" wrapperClassName="w-full" onClick={() => navigate(`/clientes/${selectedRow.customer.id}`)} />
                <IconAction label="Ver contrato" icon={<FileText />} tone="primary" variant="soft" className="w-full" wrapperClassName="w-full" onClick={() => navigate(`/clientes/${selectedRow.customer.id}/contrato`)} />
                <IconAction
                  label="Escribir por WhatsApp"
                  icon={<WhatsAppIcon />}
                  tone="whatsapp"
                  variant="soft"
                  className="w-full"
                  wrapperClassName="w-full"
                  disabled={!selectedRow.customer.phone}
                  onClick={() => window.open(`https://wa.me/${whatsappNumber(selectedRow.customer.phone ?? "")}`, "_blank", "noopener")}
                />
              </section>

              <section className="space-y-1.5 rounded-lg border p-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-2 whitespace-nowrap border-b pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deuda</span>
                  <span className="flex items-center gap-1">
                    <CustomerStatusBadge status={selectedRow.customer.status} />
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", selectedDebt ? (selectedDebt.overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700") : "bg-emerald-100 text-emerald-700")}>
                      {selectedDebt ? (selectedDebt.overdue ? "Moroso" : "Con deuda") : "Al dia"}
                    </span>
                    <strong className={cn("text-xs", selectedDebt ? (selectedDebt.overdue ? "text-red-700" : "text-amber-700") : "text-emerald-700")}>
                      {money(selectedDebt?.debt ?? 0)}
                    </strong>
                  </span>
                </div>
                <p><span className="text-xs uppercase tracking-wide text-slate-400">Telefono</span><br />{selectedRow.customer.phone || "Sin telefono"}</p>
                <p><span className="text-xs uppercase tracking-wide text-slate-400">Correo</span><br />{selectedRow.customer.email || "Sin correo"}</p>
                <p><span className="text-xs uppercase tracking-wide text-slate-400">Direccion</span><br />{selectedRow.customer.address || "Sin direccion"}{selectedRow.customer.reference ? ` (${selectedRow.customer.reference})` : ""}</p>
                <p><span className="text-xs uppercase tracking-wide text-slate-400">Zona</span><br />{[selectedRow.customer.district, selectedRow.customer.province, selectedRow.customer.department].filter(Boolean).join(", ") || "Sin zona"}</p>
              </section>

              <section className="rounded-lg border p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Servicios</span>
                  <strong className="text-sm">{money(selectedRow.monthly)}/mes</strong>
                </div>
                <div className="space-y-1">
                  {selectedRow.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        {service.plan.type === "INTERNET" ? <Wifi className="h-4 w-4 text-primary" /> : <Tv className="h-4 w-4 text-primary" />}
                        {service.plan.name}
                      </span>
                      <span className="font-semibold text-slate-700">{money(service.plan.monthlyPrice)}</span>
                    </div>
                  ))}
                  {selectedRow.services.length === 0 ? <p className="text-xs text-slate-500">Sin servicios activos.</p> : null}
                </div>
              </section>
            </div>
          </aside>
        ) : null}

        {!expanded && !selectedRow ? (
          <aside className="h-[clamp(32rem,calc(100dvh-18rem),44rem)] overflow-hidden rounded-lg border bg-background">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800"><BarChart3 className="h-4 w-4 text-primary" /> Operacion</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{visibleRows.length} clientes</span>
            </div>

            <div className="h-[calc(100%-3.2rem)] space-y-2 overflow-y-auto p-2.5 scrollbar-thin">
              <section className="rounded-lg border bg-slate-50/70 p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Geocodificacion</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", withoutCoords === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{locatedRatio}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${locatedRatio}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                  <span>{withCoords} ubicados</span>
                  <span>{withoutCoords} pendientes</span>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-2.5">
                  <p className="text-xs text-slate-500">Clientes activos</p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <strong className="text-lg leading-none text-slate-900">{activeCount}</strong>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">{activeRatio}%</span>
                  </div>
                </div>
                <div className="rounded-lg border p-2.5">
                  <p className="text-xs text-slate-500">Mensualidad</p>
                  <strong className="mt-1 block truncate text-base leading-none text-slate-900">{money(totalMonthly)}</strong>
                </div>
              </section>

              <section className="rounded-lg border p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mix de servicios</span>
                  <span className="text-xs text-slate-500">{visibleRows.length} clientes</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700"><Wifi className="h-4 w-4" /> Internet {internetCount}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700"><Tv className="h-4 w-4" /> IPTV {tvCount}</span>
                  {suspendedCount > 0 ? <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Suspendidos {suspendedCount}</span> : null}
                  {cancelledCount > 0 ? <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Cancelados {cancelledCount}</span> : null}
                </div>
              </section>

              <section className="rounded-lg border p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zonas principales</h3>
                  <span className="text-xs text-slate-500">Top 3</span>
                </div>
                <div className="space-y-1">
                  {topZones.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-2 py-1">
                      <span className="truncate text-xs text-slate-600">{name}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{count}</span>
                    </div>
                  ))}
                  {topZones.length === 0 ? <p className="text-sm text-slate-500">Sin zonas para los filtros actuales.</p> : null}
                </div>
              </section>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}













