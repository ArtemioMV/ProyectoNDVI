import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, ImagePlus, Plus, Save, Search, Trash2, Upload, UserPlus, Wrench } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { DataLoader } from "@/components/ui/DataLoader";
import { SelectField, TextField, TextareaField } from "@/components/ui/FormControls";
import { cn } from "@/components/ui/cn";
import { LocationLinks, LocationMap, UseMyLocationButton } from "@/components/map/LocationMap";
import { DisclosurePanel } from "@/components/ui/Panels";
import { useToast } from "@/components/ui/Toast";
import { SwitchField } from "@/components/ui/ToggleControls";
import { Tooltip } from "@/components/ui/Tooltip";
import { fetchMaterials } from "@/modules/productos/api/products.api";
import { demoCoordinates, fetchCountries, fetchUbigeo } from "@/services/geo/geo";
import { httpClient } from "@/services/api/http-client";
import { money } from "@/lib/format";

type MaterialRow = { key: string; materialId: string; quantity: string };

function materialPrice(material: { installPrice?: number | null; salePrice: number }) {
  return material.installPrice ?? material.salePrice;
}

type PlanType = "INTERNET" | "TV";
type ApiResponse<T> = { success: boolean; data: T; message?: string };

type ServicePlan = {
  id: string;
  type: PlanType;
  name: string;
  monthlyPrice: number;
  downloadMbps?: number | null;
  uploadMbps?: number | null;
  maxScreens?: number | null;
  isActive: boolean;
};

type ClienteForm = {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  signupDate: string;
  phone: string;
  email: string;
  country: string;
  department: string;
  province: string;
  district: string;
  address: string;
  reference: string;
  latitude: string;
  longitude: string;
  identityNotes: string;
  photoUrl: string;
  leadSource: string;
  wantsInternet: boolean;
  internetPlanId: string;
  wantsTv: boolean;
  tvPlanId: string;
  tvScreens: string;
  serviceNotes: string;
  chargeInstall: boolean;
  installCost: string;
  chargeMaterials: boolean;
};

function currentDateInputValue() {
  return new Date().toLocaleDateString("en-CA");
}

const emptyForm: ClienteForm = {
  documentType: "DNI",
  documentNumber: "",
  firstName: "",
  lastName: "",
  birthDate: "",
  signupDate: currentDateInputValue(),
  phone: "",
  email: "",
  country: "PE",
  department: "",
  province: "",
  district: "",
  address: "",
  reference: "",
  latitude: "-12.0464",
  longitude: "-77.0428",
  identityNotes: "",
  photoUrl: "",
  leadSource: "PANEL",
  wantsInternet: false,
  internetPlanId: "",
  wantsTv: false,
  tvPlanId: "",
  tvScreens: "",
  serviceNotes: "",
  chargeInstall: false,
  installCost: "",
  chargeMaterials: false
};

async function fetchPlans() {
  const response = await httpClient.get<ApiResponse<ServicePlan[]>>("/planes");
  return response.data.data;
}


function planDetail(plan: ServicePlan) {
  if (plan.type === "INTERNET") return `${plan.downloadMbps ?? 0}/${plan.uploadMbps ?? 0} Mbps`;
  return `${plan.maxScreens ?? 1} pantalla${(plan.maxScreens ?? 1) > 1 ? "s" : ""}`;
}

function optionalNumber(value: string) {
  const number = Number(value);
  return value.trim() && Number.isFinite(number) ? number : undefined;
}

function numberOrZero(value: string) {
  return optionalNumber(value) ?? 0;
}


export function ClienteNuevoPage() {
  const navigate = useNavigate();
  // Modo edicion: /clientes/:customerId/editar reutiliza este formulario, pero solo
  // identidad y ubicacion (los servicios se gestionan en su propio modulo).
  const { customerId } = useParams<{ customerId: string }>();
  const isEditing = Boolean(customerId);
  const toast = useToast();
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [materialsPanelOpen, setMaterialsPanelOpen] = useState(true);
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([]);

  const plansQuery = useQuery({ queryKey: ["service-plans"], queryFn: fetchPlans });
  const countriesQuery = useQuery({ queryKey: ["countries"], queryFn: fetchCountries, staleTime: Infinity });
  const ubigeoQuery = useQuery({ queryKey: ["ubigeo", form.country], queryFn: () => fetchUbigeo(form.country), staleTime: Infinity });
  const materialsQuery = useQuery({
    queryKey: ["installation-materials"],
    queryFn: () => fetchMaterials(""),
    enabled: form.chargeMaterials
  });
  const installMaterials = (materialsQuery.data ?? []).filter((material) => material.isInstallationMaterial);

  const departments = ubigeoQuery.data ?? [];
  const provinces = departments.find((dep) => dep.name === form.department)?.provinces ?? [];
  const districts = provinces.find((prov) => prov.name === form.province)?.districts ?? [];

  const internetPlans = useMemo(
    () => (plansQuery.data ?? []).filter((plan) => plan.type === "INTERNET" && plan.isActive),
    [plansQuery.data]
  );
  const tvPlans = useMemo(
    () => (plansQuery.data ?? []).filter((plan) => plan.type === "TV" && plan.isActive),
    [plansQuery.data]
  );

  const selectedInternet = internetPlans.find((plan) => plan.id === form.internetPlanId);
  const selectedTv = tvPlans.find((plan) => plan.id === form.tvPlanId);
  const monthlyTotal = (selectedInternet?.monthlyPrice ?? 0) + (selectedTv?.monthlyPrice ?? 0);
const hasDocument = Boolean(form.documentNumber.trim());
  const hasIdentity = Boolean(form.firstName.trim() && form.lastName.trim());
  const hasService = Boolean((form.wantsInternet && form.internetPlanId) || (form.wantsTv && form.tvPlanId));
  const hasAddress = Boolean(form.address.trim() && form.district.trim());
const materialsTotal = materialRows.reduce((sum, row) => {
    const material = installMaterials.find((item) => item.id === row.materialId);
    return sum + (material ? materialPrice(material) * numberOrZero(row.quantity) : 0);
  }, 0);
  const oneTimeTotal = (form.chargeInstall ? numberOrZero(form.installCost) : 0) + (form.chargeMaterials ? materialsTotal : 0);

  function addMaterialRow() {
    setMaterialRows((rows) => [...rows, { key: crypto.randomUUID(), materialId: "", quantity: "" }]);
  }
  function updateMaterialRow(key: string, patch: Partial<MaterialRow>) {
    setMaterialRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }
  function removeMaterialRow(key: string) {
    setMaterialRows((rows) => rows.filter((row) => row.key !== key));
  }

  const editQuery = useQuery({
    queryKey: ["customer-edit", customerId],
    queryFn: async () => (await httpClient.get<ApiResponse<Record<string, unknown>[]>>("/customers")).data.data,
    enabled: isEditing
  });

  useEffect(() => {
    if (!isEditing || !editQuery.data) return;
    const found = editQuery.data.find((item) => item.id === customerId) as Record<string, string | null> | undefined;
    if (!found) return;
    const [firstName, ...rest] = String(found.fullName ?? "").split(" ");
    setForm((current) => ({
      ...current,
      documentType: found.documentType ?? "DNI",
      documentNumber: found.documentNumber ?? "",
      firstName,
      lastName: rest.join(" "),
      birthDate: found.birthDate ? String(found.birthDate).slice(0, 10) : "",
      signupDate: found.signupDate ? String(found.signupDate).slice(0, 10) : current.signupDate,
      phone: found.phone ?? "",
      email: found.email ?? "",
      country: found.country ?? "PE",
      department: found.department ?? "",
      province: found.province ?? "",
      district: found.district ?? "",
      address: found.address ?? "",
      reference: found.reference ?? "",
      latitude: found.latitude != null ? String(found.latitude) : current.latitude,
      longitude: found.longitude != null ? String(found.longitude) : current.longitude,
      identityNotes: found.identityNotes ?? "",
      photoUrl: found.photoUrl ?? "",
      leadSource: found.leadSource ?? "PANEL"
    }));
  }, [isEditing, editQuery.data, customerId]);

  const createMutation = useMutation({
    mutationFn: async (payload: unknown) => isEditing ? httpClient.patch(`/customers/${customerId}`, payload) : httpClient.post("/customers", payload),
    onSuccess: () => {
      toast({ tone: "success", message: isEditing ? "Cliente actualizado correctamente." : "Cliente creado correctamente." });
      navigate("/clientes");
    },
    onError: () => setError("No se pudo crear el cliente. Revisa documento duplicado o datos obligatorios.")
  });

  function update<K extends keyof ClienteForm>(key: K, value: ClienteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectCountry(value: string) {
    const point = demoCoordinates(value, [value]);
    setForm((current) => ({ ...current, country: value, department: "", province: "", district: "", latitude: String(point.latitude), longitude: String(point.longitude) }));
  }

  function selectDepartment(value: string) {
    setForm((current) => {
      const point = value ? demoCoordinates(current.country, [value]) : demoCoordinates(current.country, [current.country]);
      return { ...current, department: value, province: "", district: "", latitude: String(point.latitude), longitude: String(point.longitude) };
    });
  }

  function selectProvince(value: string) {
    setForm((current) => {
      const point = value ? demoCoordinates(current.country, [current.department, value]) : demoCoordinates(current.country, [current.department]);
      return { ...current, province: value, district: "", latitude: String(point.latitude), longitude: String(point.longitude) };
    });
  }

  function selectDistrict(value: string) {
    setForm((current) => {
      const point = value
        ? demoCoordinates(current.country, [current.department, current.province, value])
        : demoCoordinates(current.country, [current.department, current.province]);
      return {
        ...current,
        district: value,
        latitude: String(point.latitude),
        longitude: String(point.longitude)
      };
    });
  }

  function handleLookup() {
    toast({ tone: "info", message: "Busqueda por API de documento pendiente. Ingresa los datos manualmente." });
  }

  function handlePhotoFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ tone: "error", message: "Selecciona una imagen valida." });
      return;
    }
    if (file.size > 1_500_000) {
      toast({ tone: "error", message: "La foto debe pesar como maximo 1.5 MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => update("photoUrl", String(reader.result ?? ""));
    reader.onerror = () => toast({ tone: "error", message: "No se pudo leer la foto seleccionada." });
    reader.readAsDataURL(file);
  }

  function checklistItem(label: string, complete: boolean) {
    return (
      <div key={label} className="flex items-center gap-1.5 py-0.5 text-slate-600">
        {complete ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />}
        <span className="truncate">{label}</span>
        <span className={cn("ml-auto shrink-0 text-[11px]", complete ? "text-primary" : "text-slate-400")}>{complete ? "Listo" : "Falta"}</span>
      </div>
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.documentNumber.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      setError("Documento, nombres y apellidos son obligatorios.");
      return;
    }

    const services: Array<Record<string, unknown>> = [];
    if (!isEditing && form.wantsInternet && !form.internetPlanId) {
      setError("Selecciona el plan de internet o apaga ese servicio.");
      return;
    }

    if (!isEditing && form.wantsTv && !form.tvPlanId) {
      setError("Selecciona el plan IPTV o apaga ese servicio.");
      return;
    }

    if (form.internetPlanId) services.push({ planId: form.internetPlanId, notes: form.serviceNotes || undefined });
    if (form.tvPlanId) {
      services.push({
        planId: form.tvPlanId,
        screenCount: optionalNumber(form.tvScreens) ?? selectedTv?.maxScreens ?? 1,
        notes: form.serviceNotes || undefined
      });
    }

    if (!isEditing && services.length === 0) {
      setError("Activa al menos un servicio de internet o IPTV.");
      return;
    }

    // Nota: costos de instalacion/materiales aun no se envian (backend pendiente, ver docs/pending-work.md).
    createMutation.mutate({
      documentType: form.documentType || undefined,
      documentNumber: form.documentNumber,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      birthDate: form.birthDate || undefined,
      signupDate: form.signupDate || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      country: form.country || undefined,
      department: form.department || undefined,
      province: form.province || undefined,
      address: form.address || undefined,
      district: form.district || undefined,
      reference: form.reference || undefined,
      latitude: optionalNumber(form.latitude),
      longitude: optionalNumber(form.longitude),
      identityNotes: form.identityNotes || undefined,
      photoUrl: form.photoUrl || undefined,
      leadSource: form.leadSource || undefined,
      services: isEditing ? undefined : services
    });
  }


  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <BackButton to="/clientes" label="Volver a clientes" />
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <h1 className="text-2xl font-semibold">Nuevo cliente</h1>
        </div>
        <p className="text-sm text-slate-500">
          Registra al cliente, su ubicacion y los servicios que contrata. El contrato se genera desde la ficha del cliente.
        </p>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <form className="space-y-5" onSubmit={submit}>
        {/* Identidad + Ubicacion, lado a lado y de igual altura */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex h-full flex-col rounded-lg border bg-background p-4">
            <h2 className="mb-3 border-b pb-2 font-semibold">Identidad</h2>
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
                <SelectField label="Tipo documento" value={form.documentType} onChange={(event) => update("documentType", event.target.value)}>
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carnet extranjeria</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </SelectField>
                <TextField label="Documento" value={form.documentNumber} onChange={(event) => update("documentNumber", event.target.value)} />
                <Tooltip label="Trae datos por documento (API pendiente)">
                  <Button type="button" variant="secondary" icon={<Search className="h-4 w-4" />} onClick={handleLookup}>
                    Buscar
                  </Button>
                </Tooltip>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Nombres" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} />
                <TextField label="Apellidos" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} />
                <TextField label="Telefono" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
                <TextField label="Correo" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
                <TextField label="Fecha de nacimiento" type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} />
                <TextField label="Fecha de alta / aniversario" type="date" value={form.signupDate} onChange={(event) => update("signupDate", event.target.value)} />
              </div>
              {/*
                Grid 2x2: fila 1 = [Comentarios | Resumen(foto)], fila 2 = [Origen | Checklist].
                CSS Grid iguala la altura de cada fila automaticamente, asi las bases de
                cada celda se alinean sin depender de flex/zoom. En movil (<xl) colapsa a
                1 columna y se apilan en orden: Comentarios, Resumen, Origen, Checklist.
              */}
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {/* Fila 1, izquierda: comentarios */}
                <label className="flex flex-col text-sm font-medium">
                  <span>Comentarios y preferencias</span>
                  <textarea
                    className="mt-1 min-h-36 flex-1 resize-y rounded-md border px-3 py-2 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Ej.: facturas por correo, referido por vecino, contacto alterno o trato preferido."
                    value={form.identityNotes}
                    onChange={(event) => update("identityNotes", event.target.value)}
                  />
                  <span className="mt-1 text-xs font-normal text-slate-500">Notas internas para atencion, facturacion y seguimiento.</span>
                </label>

                {/* Fila 1, derecha: resumen (foto) */}
                <div className="flex flex-col text-sm">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h3 className="font-medium">Resumen</h3>
                    <span className="text-xs font-medium text-slate-500">Pendiente</span>
                  </div>
                  <div className="flex flex-1 items-center gap-3 rounded-md border bg-background p-3">
                    <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/60 sm:h-28 sm:w-28">
                      {form.photoUrl ? <img src={form.photoUrl} alt="Cliente" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-slate-400" />}
                    </div>
                    <div className="grid min-w-0 flex-1 content-center gap-2">
                      <Tooltip label="Subir imagen">
                        <label className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border bg-background text-slate-600 transition hover:bg-muted">
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Subir imagen</span>
                          <input type="file" accept="image/*" className="sr-only" onChange={(event) => handlePhotoFile(event.currentTarget.files?.[0])} />
                        </label>
                      </Tooltip>
                      <input
                        className="w-full min-w-0 rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="o pega una URL de imagen"
                        value={form.photoUrl.startsWith("data:") ? "" : form.photoUrl}
                        onChange={(event) => update("photoUrl", event.target.value)}
                      />
                    </div>
                  </div>
                  <span className="mt-1 text-xs font-normal text-slate-500">Incluye la fotografia del cliente y los datos minimos para guardar.</span>
                </div>

                {/* Fila 2, izquierda: origen de captacion */}
                <fieldset className="rounded-md border bg-background px-3 pb-3 pt-1">
                  <legend className="px-1 text-xs font-medium text-slate-600">Origen de captacion</legend>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["PANEL", "Panel"],
                      ["REFERRED", "Recomendacion"],
                      ["WEBSITE", "Web"],
                      ["WHATSAPP", "WhatsApp"],
                      ["FACEBOOK", "Facebook"],
                      ["FIELD", "Campo"],
                      ["OTHER", "Otro"]
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={form.leadSource === value}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition",
                          form.leadSource === value ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-background text-slate-600 hover:bg-muted"
                        )}
                        onClick={() => update("leadSource", value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Fila 2, derecha: checklist */}
                <fieldset className="rounded-md border bg-background px-3 pb-2 pt-1 text-xs">
                  <legend className="px-1 text-xs font-medium text-slate-600">Checklist</legend>
                  <div>
                    {[
                      ["Documento", hasDocument],
                      ["Identidad", hasIdentity],
                      ["Servicio", hasService],
                      ["Direccion", hasAddress]
                    ].map(([label, complete]) => checklistItem(String(label), Boolean(complete)))}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <h2 className="mb-3 border-b pb-2 font-semibold">Ubicacion</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField label="Pais" value={form.country} onChange={(event) => selectCountry(event.target.value)}>
                {(countriesQuery.data ?? []).map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </SelectField>
              <SelectField label="Departamento" value={form.department} disabled={ubigeoQuery.isLoading || departments.length === 0} onChange={(event) => selectDepartment(event.target.value)}>
                <option value="">{departments.length ? "Selecciona..." : "Sin catalogo para este pais"}</option>
                {departments.map((dep) => (
                  <option key={dep.name} value={dep.name}>{dep.name}</option>
                ))}
              </SelectField>
              <SelectField label="Provincia" value={form.province} disabled={!form.department} onChange={(event) => selectProvince(event.target.value)}>
                <option value="">{form.department ? "Selecciona..." : "Elige departamento"}</option>
                {provinces.map((prov) => (
                  <option key={prov.name} value={prov.name}>{prov.name}</option>
                ))}
              </SelectField>
              <SelectField label="Distrito" value={form.district} disabled={!form.province} onChange={(event) => selectDistrict(event.target.value)}>
                <option value="">{form.province ? "Selecciona..." : "Elige provincia"}</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </SelectField>
              <TextField label="Direccion" fieldClassName="sm:col-span-2" value={form.address} onChange={(event) => update("address", event.target.value)} />
              <TextField label="Referencia" fieldClassName="sm:col-span-2" value={form.reference} onChange={(event) => update("reference", event.target.value)} />
              <div className="space-y-2 border-t pt-3 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <UseMyLocationButton
                    onLocate={(la, ln) => setForm((current) => ({ ...current, latitude: la.toFixed(6), longitude: ln.toFixed(6) }))}
                  />
                  <LocationLinks lat={form.latitude} lng={form.longitude} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Latitud" type="number" step="any" placeholder="-12.0464" value={form.latitude} onChange={(event) => update("latitude", event.target.value)} />
                  <TextField label="Longitud" type="number" step="any" placeholder="-77.0428" value={form.longitude} onChange={(event) => update("longitude", event.target.value)} />
                </div>
                <LocationMap
                  lat={form.latitude}
                  lng={form.longitude}
                  editable
                  onChange={(la, ln) => setForm((current) => ({ ...current, latitude: la.toFixed(6), longitude: ln.toFixed(6) }))}
                  className="h-48 w-full"
                />
                <p className="text-xs text-slate-500">Haz clic en el mapa o arrastra el pin para fijar la ubicacion.</p>
              </div>
            </div>
          </div>
        </div>

        {!isEditing ? (<>
        {/* Servicios: interruptores por servicio */}
        <div className="rounded-lg border bg-background p-4">
          <h2 className="mb-3 border-b pb-2 font-semibold">Servicios que contrata</h2>
          {plansQuery.isLoading ? (
            <DataLoader />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <SwitchField
                    label="Internet"
                    description={form.wantsInternet ? "Servicio activo para este cliente" : "No contrata internet"}
                    checked={form.wantsInternet}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        wantsInternet: event.target.checked,
                        internetPlanId: event.target.checked ? current.internetPlanId : ""
                      }))
                    }
                  />
                  {form.wantsInternet ? (
                    <SelectField label="Plan de internet" value={form.internetPlanId} onChange={(event) => update("internetPlanId", event.target.value)}>
                      <option value="">Selecciona...</option>
                      {internetPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {planDetail(plan)} - {money(plan.monthlyPrice)}
                        </option>
                      ))}
                    </SelectField>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <SwitchField
                    label="IPTV"
                    description={form.wantsTv ? "Servicio activo para este cliente" : "No contrata TV"}
                    checked={form.wantsTv}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        wantsTv: event.target.checked,
                        tvPlanId: event.target.checked ? current.tvPlanId : "",
                        tvScreens: event.target.checked ? current.tvScreens : ""
                      }))
                    }
                  />
                  {form.wantsTv ? (
                    <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                      <SelectField label="Plan IPTV" value={form.tvPlanId} onChange={(event) => update("tvPlanId", event.target.value)}>
                        <option value="">Selecciona...</option>
                        {tvPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {planDetail(plan)} - {money(plan.monthlyPrice)}
                          </option>
                        ))}
                      </SelectField>
                      <TextField label="Pantallas" type="number" min={1} value={form.tvScreens} onChange={(event) => update("tvScreens", event.target.value)} />
                    </div>
                  ) : null}
                </div>
              </div>
              <TextareaField label="Nota de instalacion" value={form.serviceNotes} onChange={(event) => update("serviceNotes", event.target.value)} />
            </div>
          )}
        </div>

        {/* Costos adicionales con interruptores */}
        <div className="space-y-3 rounded-lg border bg-background p-4">
          <h2 className="border-b pb-2 font-semibold">Costos adicionales</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <SwitchField
                label="Cobrar instalacion"
                description="Costo unico de mano de obra"
                checked={form.chargeInstall}
                onChange={(event) => update("chargeInstall", event.target.checked)}
              />
              {form.chargeInstall ? (
                <TextField label="Costo de instalacion" type="number" min={0} step="0.01" value={form.installCost} onChange={(event) => update("installCost", event.target.value)} />
              ) : null}
            </div>
            <SwitchField
              label="Cobrar materiales"
              description="Equipos y materiales que se jalan del inventario"
              checked={form.chargeMaterials}
              onChange={(event) => update("chargeMaterials", event.target.checked)}
            />
          </div>

          {form.chargeMaterials ? (
            <DisclosurePanel
              title="Materiales de instalacion"
              description={`Total materiales: ${money(materialsTotal)}`}
              open={materialsPanelOpen}
              onToggle={() => setMaterialsPanelOpen((value) => !value)}
            >
              {materialsQuery.isLoading ? <DataLoader /> : null}
              {!materialsQuery.isLoading && installMaterials.length === 0 ? (
                <Alert tone="info">
                  No hay productos marcados como "Material de instalacion". Marcalos en Inventario para poder jalarlos aqui.
                </Alert>
              ) : null}

              {installMaterials.length > 0 ? (
                <div className="space-y-2">
                  {materialRows.map((row) => {
                    const material = installMaterials.find((item) => item.id === row.materialId);
                    const subtotal = material ? materialPrice(material) * numberOrZero(row.quantity) : 0;
                    return (
                      <div key={row.key} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_6rem_auto] sm:items-end">
                        <SelectField label="Material" value={row.materialId} onChange={(event) => updateMaterialRow(row.key, { materialId: event.target.value })}>
                          <option value="">Selecciona...</option>
                          {installMaterials.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} Â· {money(materialPrice(item))}/{item.unit.toLowerCase()}
                            </option>
                          ))}
                        </SelectField>
                        <TextField
                          label={`Cantidad${material ? ` (${material.unit.toLowerCase()})` : ""}`}
                          type="number"
                          min={0}
                          step="0.01"
                          value={row.quantity}
                          onChange={(event) => updateMaterialRow(row.key, { quantity: event.target.value })}
                        />
                        <div className="text-sm sm:pb-2">
                          <span className="block text-xs text-slate-500">Subtotal</span>
                          <strong>{money(subtotal)}</strong>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Quitar material"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => removeMaterialRow(row.key)}
                        />
                      </div>
                    );
                  })}
                  <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={addMaterialRow}>
                    Agregar material
                  </Button>
                </div>
              ) : null}
            </DisclosurePanel>
          ) : null}

          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Wrench className="h-4 w-4" /> Los materiales salen del inventario (marcados como "Material de instalacion") y descuentan stock.
          </p>
        </div>

        </>) : null}

        {/* Resumen (avance del contrato) + acciones */}
        <div className="flex flex-col gap-3 rounded-lg border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="block text-xs text-slate-500">Mensualidad</span>
              <strong className="text-base">{money(monthlyTotal)}</strong>
            </div>
            <div>
              <span className="block text-xs text-slate-500">Cobro inicial (unico)</span>
              <strong className="text-base">{money(oneTimeTotal)}</strong>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/clientes")}>
              Cancelar
            </Button>
            <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={createMutation.isPending}>
              Guardar cliente
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}








