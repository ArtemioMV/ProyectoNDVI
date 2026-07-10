import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/FormControls";
import type { CreateServicePlanPayload, PlanType } from "../types/service-plans.types";

type PlanFormValues = {
  name: string;
  description: string;
  monthlyPrice: number;
  downloadMbps: number;
  uploadMbps: number;
  maxScreens: number;
};

type PlanFormProps = {
  type: PlanType;
  isSubmitting: boolean;
  onSubmit: (payload: CreateServicePlanPayload) => void;
  initialValues?: Partial<PlanFormValues>;
  submitLabel?: string;
  onCancel?: () => void;
};

const baseForm: PlanFormValues = {
  name: "",
  description: "",
  monthlyPrice: 0,
  downloadMbps: 50,
  uploadMbps: 20,
  maxScreens: 1
};

export function PlanForm({ type, isSubmitting, onSubmit, initialValues, submitLabel = "Guardar plan", onCancel }: PlanFormProps) {
  const [form, setForm] = useState<PlanFormValues>({ ...baseForm, ...initialValues });

  function updateField<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      type,
      name: form.name,
      description: form.description || undefined,
      monthlyPrice: Number(form.monthlyPrice),
      downloadMbps: type === "INTERNET" ? Number(form.downloadMbps) : undefined,
      uploadMbps: type === "INTERNET" ? Number(form.uploadMbps) : undefined,
      maxScreens: type === "TV" ? Number(form.maxScreens) : undefined
    });
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField fieldClassName="sm:col-span-2" label="Nombre del plan" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        <TextField fieldClassName="sm:col-span-2" label="Precio mensual" min={0} step="0.01" type="number" value={form.monthlyPrice} onChange={(event) => updateField("monthlyPrice", Number(event.target.value))} required />
        {type === "INTERNET" ? (
          <>
            <TextField label="Bajada Mbps" min={1} type="number" value={form.downloadMbps} onChange={(event) => updateField("downloadMbps", Number(event.target.value))} />
            <TextField label="Subida Mbps" min={1} type="number" value={form.uploadMbps} onChange={(event) => updateField("uploadMbps", Number(event.target.value))} />
          </>
        ) : (
          <TextField fieldClassName="sm:col-span-2" label="Maximo de pantallas" min={1} type="number" value={form.maxScreens} onChange={(event) => updateField("maxScreens", Number(event.target.value))} />
        )}
        <TextareaField fieldClassName="sm:col-span-2" className="min-h-16" label="Descripcion" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onCancel}>Cancelar</Button>
        ) : null}
        <Button disabled={isSubmitting} type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
