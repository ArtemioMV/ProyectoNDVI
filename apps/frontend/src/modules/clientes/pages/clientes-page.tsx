import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CreditCard, Eye, FileText, MapPin, Tv, PanelRightOpen, Phone, Plus, Search, UserRound, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LocationMap } from "@/components/map/LocationMap";
import { Button } from "@/components/ui/Button";
import { IconAction } from "@/components/ui/IconAction";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { CustomerStatusBadge } from "@/components/ui/StatusBadge";
import { CustomerFinancePanel } from "@/modules/pagos/components/CustomerFinancePanel";
import { httpClient } from "@/services/api/http-client";
import { money } from "@/lib/format";

type PlanType = "INTERNET" | "TV";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

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
  screenCount?: number | null;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  notes?: string | null;
  plan: ServicePlan;
};

type Customer = {
  id: string;
  documentNumber: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  reference?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  birthDate?: string | null;
  signupDate?: string | null;
  createdAt?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  identityNotes?: string | null;
  leadSource?: string | null;
  services: CustomerService[];
};

async function fetchCustomers(search: string) {
  const response = await httpClient.get<ApiResponse<Customer[]>>("/customers", {
    params: search ? { search } : undefined
  });
  return response.data.data;
}


function planDetail(plan: ServicePlan) {
  if (plan.type === "INTERNET") {
    return `${plan.downloadMbps ?? 0}/${plan.uploadMbps ?? 0} Mbps`;
  }
  return `${plan.maxScreens ?? 1} pantalla${(plan.maxScreens ?? 1) > 1 ? "s" : ""}`;
}

function visibleServices(customer: Customer) {
  const servicesByType = new Map<PlanType, CustomerService>();
  customer.services
    .filter((service) => service.status === "ACTIVE")
    .forEach((service) => {
      if (!servicesByType.has(service.plan.type)) servicesByType.set(service.plan.type, service);
    });
  return [servicesByType.get("INTERNET"), servicesByType.get("TV")].filter(Boolean) as CustomerService[];
}

function monthlyTotal(customer: Customer) {
  return visibleServices(customer).reduce((sum, service) => sum + service.plan.monthlyPrice, 0);
}
function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function leadSourceLabel(value?: string | null) {
  const labels: Record<string, string> = {
    PANEL: "Panel",
    REFERRED: "Recomendacion",
    WEBSITE: "Web",
    WHATSAPP: "WhatsApp",
    FACEBOOK: "Facebook",
    FIELD: "Campo",
    OTHER: "Otro"
  };
  return value ? labels[value] ?? value : "No registrado";
}

function hasLocation(customer: Customer) {
  return Boolean(customer.latitude && customer.longitude);
}

export function ClientesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);
  const [drawerPanel, setDrawerPanel] = useState<"payments" | "contract" | null>(null);

  const customersQuery = useQuery({
    queryKey: ["customers", search],
    queryFn: () => fetchCustomers(search)
  });

  const activeCustomer = useMemo(
    () => customersQuery.data?.find((customer) => customer.id === openCustomerId) ?? null,
    [customersQuery.data, openCustomerId]
  );

  const columns = useMemo<Array<DataTableColumn<Customer>>>(() => [
    {
      id: "customer",
      header: "Cliente",
      pinnedByDefault: true,
      minWidth: 210,
      cell: (customer) => (
        <div>
          <strong className="block">{customer.fullName}</strong>
          <span className="text-xs text-slate-500">DNI {customer.documentNumber}</span>
        </div>
      )
    },
    { id: "phone", header: "Telefono", cell: (customer) => customer.phone || "Sin telefono" },
    { id: "email", header: "Correo", visibleByDefault: false, cell: (customer) => customer.email || "-" },
    { id: "district", header: "Distrito", cell: (customer) => customer.district || "-" },
    {
      id: "address",
      header: "Direccion",
      minWidth: 150,
      cell: (customer) => (
        <span className="block max-w-40 whitespace-normal break-words leading-5">
          {customer.address || "Sin direccion"}
        </span>
      )
    },
    {
      id: "services",
      header: "Servicios",
      minWidth: 190,
      cell: (customer) => visibleServices(customer).length > 0 ? (
        <div className="flex flex-col items-start gap-1">
          {visibleServices(customer).map((service) => (
            <span key={service.id} className="inline-flex items-center gap-1 text-sm text-slate-700">
              {service.plan.type === "INTERNET" ? <Wifi className="h-4 w-4 text-primary" /> : <Tv className="h-4 w-4 text-primary" />}
              <span>{service.plan.name}</span>
            </span>
          ))}
        </div>
      ) : "Sin servicios"
    },
    {
      id: "monthly",
      header: "Mensualidad",
      className: "font-semibold",
      cell: (customer) => money(monthlyTotal(customer))
    },
    { id: "status", header: "Estado", cell: (customer) => <CustomerStatusBadge status={customer.status} /> },
    {
      id: "actions",
      header: "Acciones",
      cell: (customer) => (
        <IconAction label="Ver detalle" icon={<PanelRightOpen />} tone="primary" variant="soft" size="sm" onClick={() => { setDrawerPanel(null); setOpenCustomerId(customer.id); }} />
      )
    }
  ], []);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-slate-500">Registro de clientes y asignacion de servicios contratados.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate("/clientes/nuevo")}>Nuevo cliente</Button>
      </div>

      <DataTable
        storageKey="novalink.customers.table"
        title="Clientes registrados"
        description={`${customersQuery.data?.length ?? 0} cliente(s)`}
        data={customersQuery.data ?? []}
        columns={columns}
        getRowId={(customer) => customer.id}
        isLoading={customersQuery.isLoading}
        emptyMessage="No hay clientes registrados."
        minWidth={860}
        toolbar={
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Buscar por nombre, DNI o telefono" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        }
      />

      <Drawer
        size="sm"
        open={activeCustomer !== null}
        title={activeCustomer?.fullName ?? "Detalle del cliente"}
        description={activeCustomer ? `DNI ${activeCustomer.documentNumber}` : undefined}
        onClose={() => setOpenCustomerId(null)}
        footer={
          activeCustomer ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-slate-500">Mensualidad</span>
              <strong className="text-base">
                {money(monthlyTotal(activeCustomer))}
              </strong>
            </div>
          ) : null
        }
      >
        {activeCustomer ? (
          <div className="space-y-5">
            <div className="grid gap-2 rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {activeCustomer.phone || "Sin telefono"}
              </div>
              <div className="text-slate-600">
                {activeCustomer.address || "Sin direccion"}
                {activeCustomer.district ? ` - ${activeCustomer.district}` : ""}
              </div>
              <div><CustomerStatusBadge status={activeCustomer.status} /></div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <IconAction label="Ver ficha completa" icon={<Eye />} tone="success" variant="solid" className="w-full" wrapperClassName="w-full" onClick={() => navigate(`/clientes/${activeCustomer.id}`)} />
              <IconAction label="Pagos y deuda" icon={<CreditCard />} tone="primary" variant={drawerPanel === "payments" ? "solid" : "soft"} className="w-full" wrapperClassName="w-full" onClick={() => setDrawerPanel((current) => current === "payments" ? null : "payments")} />
              <IconAction label="Contrato" icon={<FileText />} tone="primary" variant={drawerPanel === "contract" ? "solid" : "soft"} className="w-full" wrapperClassName="w-full" onClick={() => setDrawerPanel((current) => current === "contract" ? null : "contract")} />
            </div>

            {drawerPanel === null ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700">Servicios contratados</h3>
                <div className="space-y-3">
                  {visibleServices(activeCustomer).length === 0 ? (
                    <p className="text-sm text-slate-500">Sin servicios contratados.</p>
                  ) : null}
                  {visibleServices(activeCustomer).map((service) => (
                    <div key={service.id} className="rounded-md border bg-background p-3">
                      <div className="flex items-center gap-2">
                        {service.plan.type === "INTERNET" ? <Wifi className="h-4 w-4 text-primary" /> : <Tv className="h-4 w-4 text-primary" />}
                        <strong className="text-sm">{service.plan.name}</strong>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{planDetail(service.plan)} - {money(service.plan.monthlyPrice)}</p>
                      {service.plan.type === "TV" ? <p className="text-sm text-slate-600">Pantallas contratadas: {service.screenCount ?? 1}</p> : null}
                      {service.notes ? <p className="mt-2 text-sm text-slate-500">{service.notes}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {drawerPanel === "payments" ? <CustomerFinancePanel customerId={activeCustomer.id} showContractButton={false} /> : null}

            {drawerPanel === "contract" ? (
              <div className="space-y-3">
                <div className="rounded-lg border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between border-b pb-2">
                    <h3 className="font-semibold">Datos del contrato</h3>
                    <IconAction label="Ver contrato completo" icon={<Eye />} tone="primary" variant="soft" size="sm" onClick={() => navigate(`/clientes/${activeCustomer.id}/contrato`)} />
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-500"><FileText className="h-4 w-4" /> Codigo</span><span className="font-medium">{activeCustomer.id.slice(0, 8).toUpperCase()}</span></div>
                    <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" /> Alta</span><span className="font-medium">{formatDate(activeCustomer.signupDate ?? activeCustomer.createdAt)}</span></div>
                    <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-500"><UserRound className="h-4 w-4" /> Captacion</span><span className="font-medium">{leadSourceLabel(activeCustomer.leadSource)}</span></div>
                    <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Servicios activos</span><span className="font-medium">{visibleServices(activeCustomer).length}</span></div>
                    <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Estado operativo</span><CustomerStatusBadge status={activeCustomer.status} /></div>
                  </div>
                </div>

                <div className="rounded-lg border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-semibold text-slate-700">Ubicacion y referencia</h3>
                    <IconAction label="Abrir mapa" icon={<MapPin />} tone="primary" variant="soft" size="sm" onClick={() => navigate("/mapa-clientes")} />
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>{activeCustomer.address || "Sin direccion"}{activeCustomer.district ? ` - ${activeCustomer.district}` : ""}</p>
                    <p>Referencia: <span className="text-slate-900">{activeCustomer.reference || "-"}</span></p>
                    <LocationMap lat={activeCustomer.latitude} lng={activeCustomer.longitude} className="h-36 w-full" />
                  </div>
                </div>

                {activeCustomer.identityNotes ? (
                  <div className="rounded-lg border bg-background p-4 text-sm">
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Notas internas</h3>
                    <p className="text-slate-600">{activeCustomer.identityNotes}</p>
                  </div>
                ) : null}

              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}









