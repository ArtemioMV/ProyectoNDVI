import { type FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { paymentMethodOptions } from "@/constants/payment-methods";
import { SelectField, TextareaField, TextField } from "@/components/ui/FormControls";
import { CheckboxField } from "@/components/ui/ToggleControls";
import type { CreateExpensePayload, ExpenseCategory, PaymentMethod } from "../types/expenses.types";

const paymentMethods = paymentMethodOptions;

export function ExpenseForm({ categories, isSubmitting, onSubmit }: { categories: ExpenseCategory[]; isSubmitting: boolean; onSubmit: (payload: CreateExpensePayload) => void }) {
  const [paidFromCash, setPaidFromCash] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      categoryId: String(form.get("categoryId") || ""),
      description: String(form.get("description") || "").trim(),
      amount: Number(form.get("amount") || 0),
      paymentMethod: String(form.get("paymentMethod") || "CASH") as PaymentMethod,
      paidFromCash,
      reference: String(form.get("reference") || "").trim() || undefined,
      notes: String(form.get("notes") || "").trim() || undefined,
      expenseDate: String(form.get("expenseDate") || "").trim() || undefined
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Categoria" name="categoryId" required>
          <option value="">Seleccionar</option>
          {categories.filter((category) => category.isActive).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </SelectField>
        <TextField label="Monto" name="amount" type="number" min="0.01" step="0.01" required />
        <TextField label="Fecha" name="expenseDate" type="date" />
        <TextField label="Descripcion" name="description" required fieldClassName="md:col-span-2" placeholder="PAGO ENERGIA CABECERA" />
        <SelectField label="Metodo de pago" name="paymentMethod" defaultValue="CASH">
          {paymentMethods().map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
        </SelectField>
        <TextField label="Referencia" name="reference" placeholder="Recibo, boleta, nota" />
      </div>
      <CheckboxField label="Pagar desde caja" description="Si esta activo, registra egreso y exige caja abierta." checked={paidFromCash} onChange={(event) => setPaidFromCash(event.target.checked)} />
      <TextareaField label="Notas" name="notes" />
      <div className="flex justify-end">
        <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar gasto"}</Button>
      </div>
    </form>
  );
}

