import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ImagePlus, Mail, Plus, Printer, Save, ShieldCheck, WalletCards } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ContractDocument, type ContractService } from "@/components/documents/ContractDocument";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DataLoader } from "@/components/ui/DataLoader";
import { AppModal } from "@/components/ui/AppModal";
import { SelectField, TextField, TextareaField } from "@/components/ui/FormControls";
import { SwitchField } from "@/components/ui/ToggleControls";
import { useToast } from "@/components/ui/Toast";
import { CompanySettings, getCompanySettings, setCompanySettings } from "@/services/settings/company-settings";
import { paymentMethodLabels, type PaymentMethodKey } from "@/constants/payment-methods";
import { createPaymentMethodSetting, fetchPaymentMethodSettings, savePaymentMethodSetting, type PaymentMethodSetting, type SavePaymentMethodSettingPayload } from "../api/payment-methods.api";
import { fetchSystemSettings, saveSystemSettings } from "../api/system-settings.api";

const sampleServices: ContractService[] = [
  { name: "Internet 100 Mbps", detail: "100/50 Mbps", monthlyPrice: 80 },
  { name: "IPTV Full", detail: "2 pantallas", monthlyPrice: 40 }
];

const emptyNewMethod = { method: "" as "" | PaymentMethodKey, label: "", description: "", sortOrder: 100, requiresEvidence: false, isActive: true };

function PaymentMethodsPanel() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const methodsQuery = useQuery({ queryKey: ["payment-method-settings"], queryFn: fetchPaymentMethodSettings });
  const [createOpen, setCreateOpen] = useState(false);
  const [newMethod, setNewMethod] = useState(emptyNewMethod);

  const configuredKeys = new Set((methodsQuery.data ?? []).map((method) => method.method));
  const missingKeys = (Object.keys(paymentMethodLabels) as PaymentMethodKey[]).filter((key) => !configuredKeys.has(key));

  const createMutation = useMutation({
    mutationFn: () => createPaymentMethodSetting({
      method: newMethod.method as PaymentMethodKey,
      label: newMethod.label.trim() || paymentMethodLabels[newMethod.method as PaymentMethodKey],
      description: newMethod.description.trim() || undefined,
      sortOrder: Number(newMethod.sortOrder) || 100,
      requiresEvidence: newMethod.requiresEvidence,
      isActive: newMethod.isActive
    }),
    onSuccess: () => {
      toast({ tone: "success", message: "Metodo de pago agregado." });
      setCreateOpen(false);
      setNewMethod(emptyNewMethod);
      void queryClient.invalidateQueries({ queryKey: ["payment-method-settings"] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo agregar el metodo. Revisa si ya existe." })
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SavePaymentMethodSettingPayload }) => savePaymentMethodSetting(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment-method-settings"] });
      toast({ tone: "success", message: "Metodo de pago actualizado." });
    }
  });

  function patchMethod(method: PaymentMethodSetting, patch: Partial<SavePaymentMethodSettingPayload>) {
    saveMutation.mutate({
      id: method.id,
      payload: {
        label: method.label,
        description: method.description ?? undefined,
        requiresEvidence: method.requiresEvidence,
        isActive: method.isActive,
        sortOrder: method.sortOrder,
        ...patch
      }
    });
  }

  return (
    <section className="rounded-lg border bg-background p-4 no-print">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <WalletCards className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <h2 className="font-semibold">Metodos de pago</h2>
            <p className="text-sm text-slate-500">Activa, ordena y define si cada metodo exige evidencia.</p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} disabled={missingKeys.length === 0} onClick={() => setCreateOpen(true)}>
          Agregar metodo
        </Button>
      </div>

      {methodsQuery.isLoading ? <DataLoader label="Cargando metodos..." className="min-h-28" /> : null}
      {methodsQuery.isError ? <Alert tone="error" className="mt-3">No se pudieron cargar los metodos de pago.</Alert> : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {(methodsQuery.data ?? []).map((method) => (
          <article key={method.id} className="rounded-md border p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
              <TextField
                label="Nombre"
                value={method.label}
                onChange={(event) => patchMethod(method, { label: event.target.value })}
                disabled={saveMutation.isPending}
              />
              <TextField
                label="Orden"
                type="number"
                value={method.sortOrder}
                onChange={(event) => patchMethod(method, { sortOrder: Number(event.target.value || 0) })}
                disabled={saveMutation.isPending}
              />
            </div>
            <TextField
              label="Descripcion"
              className="mt-3"
              value={method.description ?? ""}
              onChange={(event) => patchMethod(method, { description: event.target.value })}
              disabled={saveMutation.isPending}
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <SwitchField
                label="Activo"
                description="Disponible en ventas, compras y cobranza"
                checked={method.isActive}
                onChange={(event) => patchMethod(method, { isActive: event.target.checked })}
                disabled={saveMutation.isPending}
              />
              <SwitchField
                label="Exige evidencia"
                description="Bloquea el cobro sin comprobante"
                checked={method.requiresEvidence}
                onChange={(event) => patchMethod(method, { requiresEvidence: event.target.checked })}
                disabled={saveMutation.isPending || method.method === "CASH"}
              />
            </div>
          </article>
        ))}
      </div>

      <AppModal
        open={createOpen}
        size="sm"
        title="Agregar metodo de pago"
        description="Habilita un metodo del catalogo que aun no este configurado."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={createMutation.isPending} onClick={() => setCreateOpen(false)}>Volver</Button>
            <Button type="button" disabled={createMutation.isPending || !newMethod.method} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Agregando..." : "Agregar metodo"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <SelectField label="Metodo" value={newMethod.method} onChange={(event) => setNewMethod((current) => ({ ...current, method: event.target.value as PaymentMethodKey }))}>
            <option value="">Selecciona...</option>
            {missingKeys.map((key) => (
              <option key={key} value={key}>{paymentMethodLabels[key]}</option>
            ))}
          </SelectField>
          <TextField label="Nombre visible" placeholder="Ej. Tarjeta POS" value={newMethod.label} onChange={(event) => setNewMethod((current) => ({ ...current, label: event.target.value }))} />
          <TextField label="Descripcion" value={newMethod.description} onChange={(event) => setNewMethod((current) => ({ ...current, description: event.target.value }))} />
          <TextField label="Orden" type="number" value={newMethod.sortOrder} onChange={(event) => setNewMethod((current) => ({ ...current, sortOrder: Number(event.target.value || 0) }))} />
          <div className="grid gap-2 sm:grid-cols-2">
            <SwitchField label="Activo" description="Disponible al cobrar" checked={newMethod.isActive} onChange={(event) => setNewMethod((current) => ({ ...current, isActive: event.target.checked }))} />
            <SwitchField label="Exige evidencia" description="Bloquea el cobro sin comprobante" checked={newMethod.requiresEvidence} onChange={(event) => setNewMethod((current) => ({ ...current, requiresEvidence: event.target.checked }))} />
          </div>
        </div>
      </AppModal>
    </section>
  );
}

export function ConfiguracionPage() {
  const toast = useToast();
  const [form, setForm] = useState<CompanySettings>(() => getCompanySettings());
  const settingsQuery = useQuery({ queryKey: ["system-settings"], queryFn: fetchSystemSettings });
  const saveSettingsMutation = useMutation({
    mutationFn: saveSystemSettings,
    onSuccess: (settings) => {
      setCompanySettings(settings);
      setForm((current) => ({ ...current, ...settings, mailPassword: settings.mailPassword || current.mailPassword }));
      toast({ tone: "success", message: "Configuracion guardada en el servidor." });
    },
    onError: () => toast({ tone: "error", message: "No se pudo guardar la configuracion." })
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    setCompanySettings(settingsQuery.data);
    setForm((current) => ({ ...current, ...settingsQuery.data, mailPassword: settingsQuery.data.mailPassword || current.mailPassword }));
  }, [settingsQuery.data]);

  function update<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("logoUrl", typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanySettings(form);
    saveSettingsMutation.mutate(form);
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <h1 className="text-2xl font-semibold">Configuracion</h1>
      </div>
      <p className="text-sm text-slate-500">
        Datos de empresa, pantalla de acceso, correo, contrato y reglas operativas del sistema.
      </p>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_32rem] xl:items-start">
        {settingsQuery.isLoading ? <DataLoader label="Cargando configuracion..." className="min-h-24" /> : null}
        {settingsQuery.isError ? <Alert tone="error">No se pudo cargar la configuracion del servidor. Se muestra la copia local.</Alert> : null}
        <form className="space-y-5 no-print" onSubmit={handleSubmit}>
          <section className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-start gap-2 border-b pb-3">
              <Building2 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <h2 className="font-semibold">Empresa y contrato</h2>
                <p className="text-sm text-slate-500">Marca comercial y datos que se imprimen en documentos.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                  <ImagePlus className="h-4 w-4" /> Subir logo
                  <input className="sr-only" type="file" accept="image/*" onChange={handleLogo} />
                </label>
                {form.logoUrl ? (
                  <button type="button" className="ml-2 text-sm text-slate-500 hover:text-red-600" onClick={() => update("logoUrl", null)}>
                    Quitar
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Nombre de la empresa" value={form.companyName} onChange={(event) => update("companyName", event.target.value)} />
              <TextField label="Lema / subtitulo" value={form.tagline} onChange={(event) => update("tagline", event.target.value)} />
              <TextField label="RUC" value={form.ruc} onChange={(event) => update("ruc", event.target.value)} />
              <TextField label="Telefono" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              <TextField label="Correo publico" type="email" fieldClassName="sm:col-span-2" value={form.email} onChange={(event) => update("email", event.target.value)} />
              <TextareaField label="Direccion" fieldClassName="sm:col-span-2" value={form.address} onChange={(event) => update("address", event.target.value)} />
            </div>
          </section>

          <section className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-start gap-2 border-b pb-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <h2 className="font-semibold">Login y sesion</h2>
                <p className="text-sm text-slate-500">Textos del acceso y permanencia de sesion. El token del servidor queda en 7 dias.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Titulo del login" value={form.loginHeadline} onChange={(event) => update("loginHeadline", event.target.value)} />
              <TextField label="Pie del login" value={form.loginFooter} onChange={(event) => update("loginFooter", event.target.value)} />
              <TextField
                label="Duracion de sesion (dias)"
                type="number"
                min={1}
                max={30}
                value={form.sessionDays}
                onChange={(event) => update("sessionDays", Number(event.target.value || 7))}
              />
              <TextareaField label="Subtitulo del login" fieldClassName="sm:col-span-2" value={form.loginSubline} onChange={(event) => update("loginSubline", event.target.value)} />
            </div>
          </section>

          <section className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-start gap-2 border-b pb-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <h2 className="font-semibold">Correo SMTP</h2>
                <p className="text-sm text-slate-500">Preparado para recuperacion de contrasena, avisos y comprobantes. Guardado en el servidor; la contrasena no se muestra al consultar.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Servidor SMTP" placeholder="smtp.tudominio.com" value={form.mailHost} onChange={(event) => update("mailHost", event.target.value)} />
              <TextField label="Puerto" type="number" placeholder="587" value={form.mailPort} onChange={(event) => update("mailPort", event.target.value)} />
              <TextField label="Usuario" value={form.mailUser} onChange={(event) => update("mailUser", event.target.value)} />
              <TextField label="Contrasena" type="password" value={form.mailPassword} onChange={(event) => update("mailPassword", event.target.value)} />
              <TextField label="Remitente" type="email" fieldClassName="sm:col-span-2" placeholder="soporte@empresa.com" value={form.mailFrom} onChange={(event) => update("mailFrom", event.target.value)} />
              <SwitchField
                label="Conexion segura SSL/TLS"
                description="Usar normalmente con puerto 465"
                checked={form.mailSecure}
                onChange={(event) => update("mailSecure", event.target.checked)}
              />
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? "Guardando..." : "Guardar configuracion"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between no-print">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Vista previa del contrato</h2>
            <Button type="button" variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Imprimir
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-slate-100 p-4">
            <ContractDocument
              company={form}
              client={{ fullName: "Juan Perez Gomez", documentNumber: "12345678", address: "Av. Ejemplo 123 - Lima" }}
              services={sampleServices}
              monthlyTotal={120}
              oneTimeTotal={50}
              number="0001"
            />
          </div>
        </div>
      </div>

      <PaymentMethodsPanel />
    </section>
  );
}
