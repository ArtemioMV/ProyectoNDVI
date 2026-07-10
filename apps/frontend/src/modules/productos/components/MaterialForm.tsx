import { Image as ImageIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/FormControls";
import { SwitchField } from "@/components/ui/ToggleControls";
import type { CreateMaterialPayload } from "../types/products.types";

type MaterialFormValues = {
  sku: string;
  name: string;
  description: string;
  unit: string;
  salePrice: number;
  coveragePrice: number;
  installPrice: number;
  imageUrl: string;
  minStock: number;
  manageStock: boolean;
  isInstallationMaterial: boolean;
};

type MaterialFormProps = {
  isSubmitting: boolean;
  onSubmit: (payload: CreateMaterialPayload) => void;
  initialValues?: Partial<MaterialFormValues>;
  submitLabel?: string;
};

const initialForm: MaterialFormValues = {
  sku: "",
  name: "",
  description: "",
  unit: "UND",
  salePrice: 0,
  coveragePrice: 0,
  installPrice: 0,
  imageUrl: "",
  minStock: 0,
  manageStock: true,
  isInstallationMaterial: false
};

export function MaterialForm({ isSubmitting, onSubmit, initialValues, submitLabel = "Guardar producto" }: MaterialFormProps) {
  const [form, setForm] = useState<MaterialFormValues>({ ...initialForm, ...initialValues });

  function updateField<K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;

    onSubmit({
      sku: form.sku || undefined,
      name: form.name,
      description: form.description || undefined,
      unit: form.unit || "UND",
      salePrice: Number(form.salePrice),
      coveragePrice: form.coveragePrice || undefined,
      installPrice: form.installPrice || undefined,
      isInstallationMaterial: form.isInstallationMaterial,
      imageUrl: form.imageUrl || undefined,
      minStock: form.manageStock ? Number(form.minStock) : 0
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <SwitchField
          label="Controlar stock"
          description="Activalo para productos fisicos. El ingreso de stock se registra desde Compras o ajustes."
          checked={form.manageStock}
          onChange={(event) => updateField("manageStock", event.target.checked)}
        />
        <SwitchField
          label="Material de instalacion"
          description="Se podra jalar en el alta de cliente al cobrar materiales."
          checked={form.isInstallationMaterial}
          onChange={(event) => updateField("isInstallationMaterial", event.target.checked)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TextField label="SKU" value={form.sku} onChange={(event) => updateField("sku", event.target.value)} />
        <TextField fieldClassName="sm:col-span-2" label="Nombre" required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        <TextField label="Unidad" value={form.unit} onChange={(event) => updateField("unit", event.target.value.toUpperCase())} />
        <TextField label="Precio venta" min={0} step="0.01" required type="number" value={form.salePrice} onChange={(event) => updateField("salePrice", Number(event.target.value))} />
        <TextField label="Precio cobertura" min={0} step="0.01" type="number" value={form.coveragePrice} onChange={(event) => updateField("coveragePrice", Number(event.target.value))} />
        <TextField label="Precio instalacion" min={0} step="0.01" type="number" value={form.installPrice} onChange={(event) => updateField("installPrice", Number(event.target.value))} />
        <TextField label="Stock minimo" disabled={!form.manageStock} min={0} type="number" value={form.minStock} onChange={(event) => updateField("minStock", Number(event.target.value))} />
        <TextareaField fieldClassName="sm:col-span-2 xl:col-span-4" label="Descripcion" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
      </div>

      <div className="flex items-end gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="Producto" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <TextField
          fieldClassName="flex-1"
          label="Foto (URL)"
          hint="Link a la imagen: jpg, png, webp, etc."
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(event) => updateField("imageUrl", event.target.value)}
        />
      </div>

      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-slate-600">
        El costo y el ingreso de stock se registran desde Compras. Este formulario solo crea el catalogo del producto.
      </div>

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}