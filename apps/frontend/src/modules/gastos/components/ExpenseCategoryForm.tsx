import type { FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextareaField, TextField } from "@/components/ui/FormControls";
import type { CreateExpenseCategoryPayload, ExpenseCategoryType } from "../types/expenses.types";

const categoryTypes: Array<{ value: ExpenseCategoryType; label: string }> = [
  { value: "OPERATING", label: "Operativo" },
  { value: "RENT", label: "Alquiler" },
  { value: "UTILITY", label: "Servicios" },
  { value: "TAX", label: "Impuestos/rentas" },
  { value: "COMMISSION", label: "Comisiones" },
  { value: "TRANSPORT", label: "Movilidad" },
  { value: "PAYROLL", label: "Planilla" },
  { value: "OTHER", label: "Otros" }
];

export function ExpenseCategoryForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (payload: CreateExpenseCategoryPayload) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: String(form.get("name") || "").trim(),
      type: String(form.get("type") || "OPERATING") as ExpenseCategoryType,
      description: String(form.get("description") || "").trim() || undefined,
      isActive: true
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <TextField label="Categoria" name="name" required placeholder="Energia, alquiler, movilidad" />
      <SelectField label="Tipo" name="type" defaultValue="OPERATING">
        {categoryTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
      </SelectField>
      <TextareaField label="Descripcion" name="description" fieldClassName="md:col-span-2" />
      <div className="md:col-span-2">
        <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Crear categoria"}</Button>
      </div>
    </form>
  );
}
