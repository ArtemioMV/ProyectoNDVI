import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CalendarDays,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Tv,
  Phone,
  Pencil,
  ReceiptText,
  UserRound,
  WalletCards,
  Wifi
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LocationLinks, LocationMap } from "@/components/map/LocationMap";
import { BackButton } from "@/components/ui/BackButton";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { IconAction } from "@/components/ui/IconAction";
import { DataLoader } from "@/components/ui/DataLoader";
import { MetricCard } from "@/components/ui/Panels";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/Toast";
import { fetchCustomerPaymentHistory } from "@/modules/pagos/api/payments.api";
import type { MonthlyFee } from "@/modules/pagos/types/payments.types";
import { httpClient } from "@/services/api/http-client";
import { money } from "@/lib/format";

type PlanType = "INTERNET" | "TV";
type ServiceStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED";
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
  screenCount?: number | null;
  installedAt?: string | null;
  status: ServiceStatus;
  notes?: string | null;
  plan: ServicePlan;
};

type Customer = {
  id: string;
  documentType?: string | null;
  documentNumber: string;
  fullName: string;
  birthDate?: string | null;
  signupDate?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
  department?: string | null;
  province?: string | null;
  address?: string | null;
  district?: string | null;
  reference?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  identityNotes?: string | null;
  photoUrl?: string | null;
  status: ServiceStatus;
  createdAt: string;
  services: CustomerService[];
};

async function fetchCustomers() {
  const response = await httpClient.get<ApiResponse<Customer[]>>("/customers");
  return response.data.data;
}


function planDetail(plan: ServicePlan) {
  if (plan.type === "INTERNET") return `${plan.downloadMbps ?? 0} Mbps bajada / ${plan.uploadMbps ?? 0} Mbps subida`;
  return `${plan.maxScreens ?? 1} pantalla${(plan.maxScreens ?? 1) > 1 ? "s" : ""}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function formatShortDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function daysUntil(value?: string | null) {
  if (!value) return null;
  const today = new Date();
  const due = new Date(value);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

const statusStyles: Record<ServiceStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700 ring-green-100",
  SUSPENDED: "bg-yellow-50 text-yellow-700 ring-yellow-100",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200"
};
const statusLabels: Record<ServiceStatus, string> = { ACTIVE: "Activo", SUSPENDED: "Suspendido", CANCELLED: "Cancelado" };

const feeStatusStyles: Record<MonthlyFee["status"], string> = {
  PAID: "bg-green-50 text-green-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  PENDING: "bg-orange-50 text-orange-700",
  VOID: "bg-slate-100 text-slate-500"
};
const feeStatusLabels: Record<MonthlyFee["status"], string> = {
  PAID: "Pagado",
  PARTIAL: "Parcial",
  PENDING: "Pendiente",
  VOID: "Anulado"
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={["rounded-full px-2.5 py-1 text-xs font-semibold ring-1", statusStyles[status]].join(" ")}>{statusLabels[status]}</span>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1.25rem_8rem_1fr] items-start gap-2 text-sm">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

type StatusChange = {
  kind: "customer" | "service";
  serviceId?: string;
  serviceName?: string;
  status: ServiceStatus;
};

const statusChangeCopy: Record<ServiceStatus, { verb: string; tone: "warning" | "danger" | "success" }> = {
  SUSPENDED: { verb: "Suspender", tone: "warning" },
  CANCELLED: { verb: "Cancelar", tone: "danger" },
  ACTIVE: { verb: "Reactivar", tone: "success" }
};

export function ClienteDetallePage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [pendingChange, setPendingChange] = useState<StatusChange | null>(null);
  const customersQuery = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const historyQuery = useQuery({
    queryKey: ["customer-payment-history", customerId],
    queryFn: () => fetchCustomerPaymentHistory(customerId ?? ""),
    enabled: Boolean(customerId)
  });
  const customer = (customersQuery.data ?? []).find((item) => item.id === customerId);

  const paymentSummary = useMemo(() => {
    const fees = historyQuery.data?.fees ?? [];
    const pending = fees.filter((fee) => fee.balance > 0).sort((a, b) => new Date(a.dueDate ?? "2999-12-31").getTime() - new Date(b.dueDate ?? "2999-12-31").getTime());
    const payments = fees.flatMap((fee) => fee.payments.map((payment) => ({ ...payment, fee })));
    const lastPayment = payments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];
    return { nextFee: pending[0], lastPayment, visibleFees: fees.slice(0, 6) };
  }, [historyQuery.data?.fees]);

  const statusMutation = useMutation({
    mutationFn: async (change: StatusChange) => {
      const base = `/customers/${customerId}`;
      const url = change.kind === "customer" ? `${base}/estado` : `${base}/servicios/${change.serviceId}/estado`;
      return httpClient.patch(url, { status: change.status });
    },
    onSuccess: (_data, change) => {
      toast({ tone: "success", message: change.kind === "customer" ? "Estado del cliente actualizado." : "Estado del servicio actualizado." });
      setPendingChange(null);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-payment-history", customerId] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo cambiar el estado. Intenta de nuevo." })
  });

  /** Acciones disponibles segun el estado actual (activo -> suspender/cancelar, etc.). */
  function transitionsFor(status: ServiceStatus): ServiceStatus[] {
    if (status === "ACTIVE") return ["SUSPENDED", "CANCELLED"];
    if (status === "SUSPENDED") return ["ACTIVE", "CANCELLED"];
    return ["ACTIVE"];
  }

  function statusIcon(status: ServiceStatus) {
    if (status === "SUSPENDED") return <PauseCircle />;
    if (status === "CANCELLED") return <Ban />;
    return <PlayCircle />;
  }

  if (customersQuery.isLoading) return <DataLoader />;
  if (!customer) {
    return (
      <section className="space-y-4">
        <BackButton to="/clientes" label="Volver a clientes" />
        <div className="rounded-lg border bg-background p-6 text-sm text-slate-500">Cliente no encontrado.</div>
      </section>
    );
  }

  const activeServices = customer.services.filter((service) => service.status === "ACTIVE");
  const activeMonthly = activeServices.reduce((sum, service) => sum + service.plan.monthlyPrice, 0);
  const debt = historyQuery.data?.totalDebt ?? 0;
  const nextDueDays = daysUntil(paymentSummary.nextFee?.dueDate);
  const tags = [
    customer.services.some((service) => service.plan.type === "INTERNET") ? "Fibra" : null,
    customer.services.some((service) => service.plan.type === "TV") ? "IPTV" : null,
    customer.district || customer.province || "Residencial"
  ].filter(Boolean);

  return (
    <section className="space-y-5">
      <BackButton to="/clientes" label="Clientes" />

      {/* Identidad del cliente en tarjeta, antes de los KPI; boton alineado como en las demas paginas */}
      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {customer.photoUrl ? (
            <img src={customer.photoUrl} alt={customer.fullName} className="h-12 w-12 rounded-lg border object-cover" />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold">{customer.fullName}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-slate-500">{customer.documentType || "DNI"} {customer.documentNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {transitionsFor(customer.status).map((next) => (
            <IconAction
              key={next}
              label={`${statusChangeCopy[next].verb} cliente`}
              icon={statusIcon(next)}
              tone={statusChangeCopy[next].tone}
              variant="soft"
              size="sm"
              onClick={() => setPendingChange({ kind: "customer", status: next })}
            />
          ))}
          <Button type="button" icon={<CreditCard className="h-4 w-4" />} onClick={() => navigate(`/clientes/${customer.id}/pagos`)}>Gestionar pagos</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<WalletCards className="h-4 w-4" />} label="Deuda total" value={money(debt)} hint={debt > 0 ? "Tiene saldo pendiente" : "Sin deuda"} tone={debt > 0 ? "warning" : "success"} />
        <MetricCard icon={<CalendarDays className="h-4 w-4" />} label="Proximo vencimiento" value={formatShortDate(paymentSummary.nextFee?.dueDate)} hint={nextDueDays === null ? "Sin cuotas pendientes" : nextDueDays >= 0 ? `En ${nextDueDays} dias` : `Vencido hace ${Math.abs(nextDueDays)} dias`} tone={nextDueDays !== null && nextDueDays < 0 ? "warning" : "neutral"} />
        <MetricCard icon={<CheckCircle2 className="h-4 w-4" />} label="Ultimo pago" value={paymentSummary.lastPayment ? money(paymentSummary.lastPayment.amount) : "-"} hint={formatShortDate(paymentSummary.lastPayment?.paidAt)} tone="success" />
        <MetricCard icon={<Wifi className="h-4 w-4" />} label="Servicios activos" value={String(activeServices.length)} hint={`${money(activeMonthly)} / mes`} tone="neutral" />
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-[1fr_25rem]">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Detalle de planes y servicios</h2>
              <span className="text-sm text-slate-500">Activos: <strong className="text-foreground">{money(activeMonthly)}/mes</strong></span>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid gap-3 lg:grid-cols-2">
                {([
                  { type: "INTERNET" as const, title: "Internet", Icon: Wifi },
                  { type: "TV" as const, title: "IPTV", Icon: Tv }
                ]).map(({ type, title, Icon }) => {
                  const groupServices = customer.services.filter((service) => service.plan.type === type);
                  return (
                    <section key={type} className="space-y-2">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Icon className="h-4 w-4 text-primary" /> {title}
                      </h3>
                      {groupServices.map((service) => (
                        <article key={service.id} className="overflow-hidden rounded-lg border">
                          <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <strong className="truncate text-sm">{service.plan.name}</strong>
                              <StatusBadge status={service.status} />
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <strong className="text-sm">{money(service.plan.monthlyPrice)}<span className="font-normal text-slate-500">/mes</span></strong>
                              {transitionsFor(service.status).map((next) => (
                                <IconAction
                                  key={next}
                                  label={`${statusChangeCopy[next].verb} servicio`}
                                  icon={statusIcon(next)}
                                  tone={statusChangeCopy[next].tone}
                                  variant="soft"
                                  size="sm"
                                  onClick={() => setPendingChange({ kind: "service", serviceId: service.id, serviceName: service.plan.name, status: next })}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1 px-3 py-2 text-xs text-slate-600">
                            <p><span className="text-slate-400">Plan:</span> {planDetail(service.plan)}</p>
                            <p><span className="text-slate-400">Instalacion:</span> {formatDate(service.installedAt ?? customer.signupDate ?? customer.createdAt)}</p>
                            <p><span className="text-slate-400">Configuracion:</span> {service.plan.type === "TV" ? `${service.screenCount ?? service.plan.maxScreens ?? 1} pantalla(s)` : "Router / ONT"}</p>
                            {service.notes ? <p className="text-slate-500">{service.notes}</p> : null}
                          </div>
                        </article>
                      ))}
                      {groupServices.length === 0 ? <p className="rounded-md border border-dashed p-3 text-xs text-slate-500">Sin servicios de {title}.</p> : null}
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-lg border bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Historial de pagos</h2>
              <Button type="button" size="sm" variant="ghost" icon={<ReceiptText className="h-4 w-4" />} onClick={() => navigate(`/clientes/${customer.id}/pagos`)}>Ver historial completo</Button>
            </div>
            {historyQuery.isLoading ? <DataLoader label="Cargando pagos..." className="min-h-24" /> : null}
            {!historyQuery.isLoading && paymentSummary.visibleFees.length === 0 ? <div className="p-4 text-sm text-slate-500">No hay mensualidades generadas.</div> : null}
            {paymentSummary.visibleFees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase text-slate-500">
                    <tr><th className="px-4 py-3">Periodo</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Pagado</th><th className="px-4 py-3">Saldo</th><th className="px-4 py-3">Estado</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {paymentSummary.visibleFees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="px-4 py-3 font-medium">{fee.period}</td>
                        <td className="px-4 py-3">{money(fee.amount)}</td>
                        <td className="px-4 py-3">{money(fee.paidAmount)}</td>
                        <td className="px-4 py-3">{money(fee.balance)}</td>
                        <td className="px-4 py-3"><span className={["rounded-full px-2 py-1 text-xs font-semibold", feeStatusStyles[fee.status]].join(" ")}>{feeStatusLabels[fee.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <h2 className="font-semibold">Datos del cliente</h2>
              <Tooltip label="Actualizar datos del cliente">
                <button type="button" className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border bg-background text-slate-600 transition hover:bg-muted" aria-label="Actualizar datos del cliente" onClick={() => navigate(`/clientes/${customer.id}/editar`)}>
                  <Pencil className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <InfoRow icon={<FileText className="h-4 w-4" />} label="Documento" value={`${customer.documentType || "DNI"} ${customer.documentNumber}`} />
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Nacimiento" value={formatDate(customer.birthDate)} />
              <InfoRow icon={<Clock3 className="h-4 w-4" />} label="Alta" value={formatDate(customer.signupDate ?? customer.createdAt)} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefono" value={customer.phone || "-"} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Correo" value={customer.email || "-"} />
              <InfoRow icon={<UserRound className="h-4 w-4" />} label="Notas" value={customer.identityNotes || "-"} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => <span key={tag} className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{tag}</span>)}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <h2 className="mb-3 flex items-center gap-2 border-b pb-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Ubicacion</h2>
            <dl className="space-y-1 text-sm">
              <div><dt className="inline text-slate-500">Direccion: </dt><dd className="inline">{customer.address || "-"}</dd></div>
              <div><dt className="inline text-slate-500">Distrito: </dt><dd className="inline">{customer.district || "-"}</dd></div>
              <div><dt className="inline text-slate-500">Provincia: </dt><dd className="inline">{customer.province || "-"}</dd></div>
              <div><dt className="inline text-slate-500">Referencia: </dt><dd className="inline">{customer.reference || "-"}</dd></div>
            </dl>
            <LocationMap lat={customer.latitude} lng={customer.longitude} className="mt-3 h-40 w-full" />
            <div className="mt-2"><LocationLinks lat={customer.latitude} lng={customer.longitude} /></div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <h2 className="font-semibold">Contrato</h2>
              <Tooltip label="Ver contrato">
                <button type="button" className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border bg-background text-slate-600 transition hover:bg-muted" aria-label="Ver contrato" onClick={() => navigate(`/clientes/${customer.id}/contrato`)}>
                  <FileText className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Nro. de contrato</span><strong>{customer.id.slice(0, 8).toUpperCase()}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Fecha de alta</span><strong>{formatDate(customer.signupDate ?? customer.createdAt)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Mensualidad</span><strong>{money(activeMonthly)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Estado</span><StatusBadge status={customer.status} /></div>
            </div>
          </div>
        </aside>
      </div>

      <AppModal
        open={pendingChange !== null}
        size="sm"
        title={pendingChange ? `${statusChangeCopy[pendingChange.status].verb} ${pendingChange.kind === "customer" ? "cliente" : "servicio"}` : ""}
        description={pendingChange?.kind === "service" ? pendingChange.serviceName : customer.fullName}
        onClose={() => setPendingChange(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={statusMutation.isPending} onClick={() => setPendingChange(null)}>Volver</Button>
            <Button
              type="button"
              variant={pendingChange?.status === "CANCELLED" ? "danger" : "primary"}
              disabled={statusMutation.isPending}
              onClick={() => pendingChange && statusMutation.mutate(pendingChange)}
            >
              {statusMutation.isPending ? "Aplicando..." : pendingChange ? statusChangeCopy[pendingChange.status].verb : ""}
            </Button>
          </div>
        }
      >
        {pendingChange ? (
          <div className="space-y-2 text-sm text-slate-600">
            {pendingChange.kind === "customer" ? (
              <p>
                {pendingChange.status === "SUSPENDED" ? "Se suspendera al cliente y todos sus servicios activos. Las deudas se mantienen." : null}
                {pendingChange.status === "CANCELLED" ? "Se cancelara al cliente y TODOS sus servicios. Esta accion cierra la relacion comercial (las deudas se mantienen)." : null}
                {pendingChange.status === "ACTIVE" ? "Se reactivara al cliente y sus servicios suspendidos volveran a estar activos." : null}
              </p>
            ) : (
              <p>
                {pendingChange.status === "SUSPENDED" ? "El servicio quedara suspendido y dejara de facturar hasta reactivarlo." : null}
                {pendingChange.status === "CANCELLED" ? "El servicio quedara cancelado. Podras reactivarlo mas adelante si el cliente vuelve." : null}
                {pendingChange.status === "ACTIVE" ? "El servicio volvera a estar activo y retomara su ciclo de facturacion." : null}
              </p>
            )}
          </div>
        ) : null}
      </AppModal>
    </section>
  );
}