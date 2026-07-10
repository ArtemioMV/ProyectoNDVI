import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowDownCircle, ArrowUpCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RadioCardGroup } from "@/components/ui/ChoiceControls";
import { TextareaField, TextField } from "@/components/ui/FormControls";
import type { CashMovementType, CreateCashMovementPayload } from "../types/cash-register.types";

const movementOptions: Array<{ value: CashMovementType; label: string; description: string; icon: ReactNode }> = [
  { value: "INCOME", label: "Ingreso", description: "Entrada manual de efectivo a caja.", icon: <ArrowUpCircle className="h-4 w-4" /> },
  { value: "EXPENSE", label: "Egreso", description: "Salida manual de efectivo de caja.", icon: <ArrowDownCircle className="h-4 w-4" /> }
];

export function CashMovementForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (payload: CreateCashMovementPayload) => void }) {
  const [type, setType] = useState<CashMovementType>("INCOME");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      type,
      amount: Number(form.get("amount") || 0),
      description: String(form.get("description") || "").trim(),
      referenceId: String(form.get("referenceId") || "").trim() || undefined
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <RadioCardGroup label="Tipo de movimiento" value={type} options={movementOptions} onChange={setType} columns="two" />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Monto" name="amount" type="number" min="0.01" step="0.01" required />
        <TextField label="Referencia" name="referenceId" placeholder="Boleta, recibo o motivo" />
        <TextareaField label="Descripcion" name="description" required fieldClassName="md:col-span-2" placeholder="Detalle del movimiento" />
      </div>
      <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar movimiento"}</Button>
    </form>
  );
}
