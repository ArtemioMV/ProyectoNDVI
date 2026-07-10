import { type FormEvent, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { paymentMethodOptions } from "@/constants/payment-methods";
import { SelectField, TextareaField, TextField } from "@/components/ui/FormControls";
import type { CreateMaterialSalePayload, Material, PaymentMethod } from "../types/sales.types";
import { money } from "@/lib/format";

type SaleFormProps = {
  materials: Material[];
  isSubmitting: boolean;
  onSubmit: (payload: CreateMaterialSalePayload) => void;
};

type SaleLine = {
  materialId: string;
  quantity: number;
};

const paymentMethods = paymentMethodOptions;


export function SaleForm({ materials, isSubmitting, onSubmit }: SaleFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<SaleLine[]>([{ materialId: "", quantity: 1 }]);

  const materialsById = useMemo(() => new Map(materials.map((material) => [material.id, material])), [materials]);
  const grossTotal = lines.reduce((sum, line) => {
    const material = materialsById.get(line.materialId);
    return sum + (material ? material.salePrice * line.quantity : 0);
  }, 0);
  const total = Math.max(grossTotal - discountAmount, 0);

  function updateLine(index: number, line: SaleLine) {
    setLines((current) => current.map((item, itemIndex) => (itemIndex === index ? line : item)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const items = lines.filter((line) => line.materialId && line.quantity > 0);
    if (items.length === 0) return;

    onSubmit({
      customerName: customerName.trim() || undefined,
      documentNumber: documentNumber.trim() || undefined,
      paymentMethod,
      discountAmount,
      notes: notes.trim() || undefined,
      items
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-3 rounded-md border bg-muted px-3 py-2 text-sm sm:grid-cols-3">
        <span>Bruto: <strong>{money(grossTotal)}</strong></span>
        <span>Descuento: <strong>{money(discountAmount)}</strong></span>
        <span>Total caja: <strong>{money(total)}</strong></span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <TextField label="Cliente" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
        <TextField label="Documento" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} />
        <SelectField label="Metodo de pago" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
          {paymentMethods().map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
        </SelectField>
      </div>

      <TextField label="Descuento" type="number" min="0" step="0.01" value={discountAmount} onChange={(event) => setDiscountAmount(Number(event.target.value))} />

      <div className="space-y-2">
        {lines.map((line, index) => {
          const material = materialsById.get(line.materialId);
          return (
            <div key={`${index}-${line.materialId}`} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_120px_44px] sm:items-end">
              <SelectField label="Material" value={line.materialId} onChange={(event) => updateLine(index, { ...line, materialId: event.target.value })}>
                <option value="">Seleccionar</option>
                {materials.filter((item) => item.isActive && item.stock > 0).map((item) => (
                  <option key={item.id} value={item.id}>{item.name} - {money(item.salePrice)} - stock {item.stock}</option>
                ))}
              </SelectField>
              <TextField label="Cantidad" min={1} max={material?.stock ?? undefined} type="number" value={line.quantity} onChange={(event) => updateLine(index, { ...line, quantity: Number(event.target.value) })} />
              <Button type="button" variant="ghost" size="sm" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Quitar item">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setLines((current) => [...current, { materialId: "", quantity: 1 }])}>Agregar item</Button>
      <TextareaField label="Nota" value={notes} onChange={(event) => setNotes(event.target.value)} />
      <div className="flex justify-end">
        <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar venta"}</Button>
      </div>
    </form>
  );
}

