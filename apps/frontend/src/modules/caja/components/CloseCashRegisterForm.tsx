import type { FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/FormControls";
import type { CloseCashRegisterPayload } from "../types/cash-register.types";

export function CloseCashRegisterForm({ expectedAmount, isSubmitting, onSubmit }: { expectedAmount: number; isSubmitting: boolean; onSubmit: (payload: CloseCashRegisterPayload) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      countedAmount: Number(form.get("countedAmount") || 0),
      notes: String(form.get("notes") || "").trim() || undefined
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <TextField label="Monto contado" name="countedAmount" type="number" min="0" step="0.01" required defaultValue={expectedAmount.toFixed(2)} />
      <TextareaField label="Notas de cierre" name="notes" fieldClassName="md:col-span-2" placeholder="Detalle de diferencia o cierre sin observaciones" />
      <div className="md:col-span-2">
        <Button type="submit" variant="danger" icon={<LockKeyhole className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Cerrando..." : "Cerrar caja"}</Button>
      </div>
    </form>
  );
}
