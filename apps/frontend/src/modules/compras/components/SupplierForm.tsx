import type { FormEvent } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, Search } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SelectField, TextareaField, TextField } from "@/components/ui/FormControls";
import { fetchCountries, fetchUbigeo } from "@/services/geo/geo";
import type { CreateSupplierPayload } from "../types/purchases.types";

type SupplierFormProps = {
  isSubmitting: boolean;
  submitLabel?: string;
  compact?: boolean;
  onSubmit: (payload: CreateSupplierPayload) => void;
  initialValues?: Partial<SupplierFormState>;
};

type SupplierFormState = CreateSupplierPayload & { country: string; department: string; province: string; district: string };

const emptyForm: SupplierFormState = {
  name: "",
  documentNumber: "",
  contactName: "",
  phone: "",
  email: "",
  country: "PE",
  department: "",
  province: "",
  district: "",
  address: "",
  reference: "",
  notes: "",
  isActive: true
};

export function SupplierForm({ isSubmitting, submitLabel = "Crear proveedor", compact = false, onSubmit, initialValues }: SupplierFormProps) {
  const [form, setForm] = useState<SupplierFormState>({ ...emptyForm, ...initialValues });
  const [lookupNote, setLookupNote] = useState<string | null>(null);

  const countriesQuery = useQuery({ queryKey: ["countries"], queryFn: fetchCountries, staleTime: Infinity });
  const ubigeoQuery = useQuery({ queryKey: ["ubigeo", form.country], queryFn: () => fetchUbigeo(form.country), staleTime: Infinity });

  const departments = ubigeoQuery.data ?? [];
  const provinces = departments.find((dep) => dep.name === form.department)?.provinces ?? [];
  const districts = provinces.find((prov) => prov.name === form.province)?.districts ?? [];

  function update<K extends keyof SupplierFormState>(key: K, value: SupplierFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectCountry(value: string) {
    setForm((current) => ({ ...current, country: value, department: "", province: "", district: "" }));
  }

  function selectDepartment(value: string) {
    setForm((current) => ({ ...current, department: value, province: "", district: "" }));
  }

  function selectProvince(value: string) {
    setForm((current) => ({ ...current, province: value, district: "" }));
  }

  function handleLookup() {
    setLookupNote("Busqueda por API de documento pendiente. Ingresa los datos del proveedor manualmente por ahora.");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      documentNumber: form.documentNumber?.trim() || undefined,
      contactName: form.contactName?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      country: form.country || "PE",
      department: form.department || undefined,
      province: form.province || undefined,
      district: form.district || undefined,
      address: form.address?.trim() || undefined,
      reference: form.reference?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      isActive: true
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className={compact ? "grid gap-4 lg:grid-cols-2" : "grid gap-5 lg:grid-cols-2"}>
        <section className={compact ? "space-y-3" : "rounded-lg border bg-background p-4"}>
          {!compact ? <h2 className="mb-3 border-b pb-2 font-semibold">Datos del proveedor</h2> : null}
          <div className="space-y-3">
            <TextField label="Proveedor" value={form.name} onChange={(event) => update("name", event.target.value)} required />
            <div>
              <label className="block text-sm font-medium">Documento</label>
              <div className="mt-1 flex gap-2">
                <input className="w-full rounded-md border px-3 py-2 font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.documentNumber} onChange={(event) => update("documentNumber", event.target.value)} />
                <Button type="button" variant="secondary" icon={<Search className="h-4 w-4" />} onClick={handleLookup}>Buscar</Button>
              </div>
            </div>
            {lookupNote ? <Alert tone="info">{lookupNote}</Alert> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Contacto" value={form.contactName} onChange={(event) => update("contactName", event.target.value)} />
              <TextField label="Telefono" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              <TextField label="Correo" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} fieldClassName="sm:col-span-2" />
            </div>
          </div>
        </section>

        <section className={compact ? "space-y-3" : "rounded-lg border bg-background p-4"}>
          {!compact ? <h2 className="mb-3 border-b pb-2 font-semibold">Ubicacion</h2> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Pais" value={form.country} onChange={(event) => selectCountry(event.target.value)}>
              {(countriesQuery.data ?? []).map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </SelectField>
            <SelectField label="Departamento" value={form.department} disabled={ubigeoQuery.isLoading || departments.length === 0} onChange={(event) => selectDepartment(event.target.value)}>
              <option value="">{departments.length ? "Selecciona..." : "Sin catalogo para este pais"}</option>
              {departments.map((dep) => <option key={dep.name} value={dep.name}>{dep.name}</option>)}
            </SelectField>
            <SelectField label="Provincia" value={form.province} disabled={!form.department} onChange={(event) => selectProvince(event.target.value)}>
              <option value="">{form.department ? "Selecciona..." : "Elige departamento"}</option>
              {provinces.map((prov) => <option key={prov.name} value={prov.name}>{prov.name}</option>)}
            </SelectField>
            <SelectField label="Distrito" value={form.district} disabled={!form.province} onChange={(event) => update("district", event.target.value)}>
              <option value="">{form.province ? "Selecciona..." : "Elige provincia"}</option>
              {districts.map((dist) => <option key={dist} value={dist}>{dist}</option>)}
            </SelectField>
            <TextField label="Direccion" value={form.address} onChange={(event) => update("address", event.target.value)} fieldClassName="sm:col-span-2" />
            <TextField label="Referencia" value={form.reference} onChange={(event) => update("reference", event.target.value)} fieldClassName="sm:col-span-2" />
          </div>
        </section>
      </div>
      <TextareaField label="Notas" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
      <div className="flex justify-end">
        <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Guardando..." : submitLabel}</Button>
      </div>
    </form>
  );
}

