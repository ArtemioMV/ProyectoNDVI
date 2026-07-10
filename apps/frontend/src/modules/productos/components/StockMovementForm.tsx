import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RadioCardGroup } from "@/components/ui/ChoiceControls";
import { SelectField, TextField } from "@/components/ui/FormControls";
import type { CreateMaterialMovementPayload, Material } from "../types/products.types";

type StockMovementFormProps = {
  materials: Material[];
  isSubmitting: boolean;
  onSubmit: (materialId: string, payload: CreateMaterialMovementPayload) => void;
};

const movementOptions: Array<{ value: CreateMaterialMovementPayload["type"]; label: string; description: string }> = [
  { value: "INSTALLATION", label: "Instalacion", description: "Material usado en una instalacion." },
  { value: "REPLACEMENT", label: "Reposicion", description: "Cambio entregado a cliente o tecnico." },
  { value: "RETURN", label: "Devolucion", description: "Material que vuelve al almacen." },
  { value: "ADJUSTMENT_IN", label: "Ajuste +", description: "Correccion que aumenta stock." },
  { value: "ADJUSTMENT_OUT", label: "Ajuste -", description: "Correccion que reduce stock." }
];

export function StockMovementForm({ materials, isSubmitting, onSubmit }: StockMovementFormProps) {
  const [materialId, setMaterialId] = useState("");
  const [type, setType] = useState<CreateMaterialMovementPayload["type"]>("INSTALLATION");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!materialId) return;
    onSubmit(materialId, {
      type,
      quantity: Number(quantity),
      reason: reason || undefined,
      reference: reference || undefined
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <SelectField label="Producto" value={materialId} onChange={(event) => setMaterialId(event.target.value)} required>
        <option value="">Seleccionar producto</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>{material.name} - stock {material.stock}</option>
        ))}
      </SelectField>

      <RadioCardGroup label="Tipo de movimiento" value={type} options={movementOptions} onChange={setType} columns="three" />

      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="Cantidad" min={1} type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
        <TextField label="Referencia" placeholder="OT, ticket o motivo" value={reference} onChange={(event) => setReference(event.target.value)} />
        <TextField label="Observacion" value={reason} onChange={(event) => setReason(event.target.value)} />
      </div>

      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-slate-600">
        Las compras y sus costos se registran en el modulo Compras. Este panel solo corrige o descuenta stock operativo.
      </div>

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">Registrar movimiento</Button>
      </div>
    </form>
  );
}