import type { FormEvent } from "react";
import { WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/FormControls";
import type { OpenCashRegisterPayload } from "../types/cash-register.types";

export function OpenCashRegisterForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (payload: OpenCashRegisterPayload) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      initialAmount: Number(form.get("initialAmount") || 0),
      notes: String(form.get("notes") || "").trim() || undefined
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <TextField label="Monto inicial" name="initialAmount" type="number" min="0" step="0.01" required defaultValue="0" />
      <TextareaField label="Notas" name="notes" placeholder="Apertura turno manana" fieldClassName="md:col-span-2" />
      <div className="md:col-span-2">
        <Button type="submit" icon={<WalletCards className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Abriendo..." : "Abrir caja"}</Button>
      </div>
    </form>
  );
}
