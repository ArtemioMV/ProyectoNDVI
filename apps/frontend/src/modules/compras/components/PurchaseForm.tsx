import { type FormEvent, useMemo, useState } from "react";
import { Plus, Save, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { paymentMethodOptions } from "@/constants/payment-methods";
import { CheckboxField } from "@/components/ui/ToggleControls";
import { SelectField, TextareaField, TextField } from "@/components/ui/FormControls";
import { AppModal } from "@/components/ui/AppModal";
import type { Material } from "@/modules/productos/types/products.types";
import type { CreateMaterialPurchasePayload, CreateSupplierPayload, PaymentMethod, Supplier } from "../types/purchases.types";
import { SupplierForm } from "./SupplierForm";
import { money } from "@/lib/format";

type PurchaseLine = {
  materialId: string;
  description: string;
  quantity: number;
  quantityText: string;
  unitCost: number;
};

type PurchaseFormProps = {
  materials: Material[];
  suppliers: Supplier[];
  isSubmitting: boolean;
  isCreatingSupplier: boolean;
  onCreateSupplier: (payload: CreateSupplierPayload) => Promise<Supplier>;
  onSubmit: (payload: CreateMaterialPurchasePayload) => void;
};

const paymentMethods = paymentMethodOptions;


export function PurchaseForm({ materials, suppliers, isSubmitting, isCreatingSupplier, onCreateSupplier, onSubmit }: PurchaseFormProps) {
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierPanelOpen, setSupplierPanelOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paidFromCash, setPaidFromCash] = useState(true);
  const [lines, setLines] = useState<PurchaseLine[]>([{ materialId: "", description: "", quantity: 1, quantityText: "", unitCost: 0 }]);

  const materialsById = useMemo(() => new Map(materials.map((material) => [material.id, material])), [materials]);
  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);

  function updateLine(index: number, line: PurchaseLine) {
    setLines((current) => current.map((item, itemIndex) => (itemIndex === index ? line : item)));
  }

  function selectMaterial(index: number, materialId: string) {
    const material = materialsById.get(materialId);
    const current = lines[index];
    updateLine(index, {
      ...current,
      materialId,
      description: material ? material.name : current.description,
      unitCost: material?.costPrice ?? current.unitCost
    });
  }

  async function createInlineSupplier(payload: CreateSupplierPayload) {
    const supplier = await onCreateSupplier(payload);
    setSupplierId(supplier.id);
    setSupplierName("");
    setSupplierPanelOpen(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const items = lines
      .filter((line) => line.description.trim() && line.quantity > 0 && line.unitCost >= 0)
      .map((line) => ({
        materialId: line.materialId || undefined,
        description: line.description.trim(),
        quantity: line.quantity,
        quantityText: line.quantityText.trim() || undefined,
        unitCost: line.unitCost
      }));
    if (items.length === 0) return;

    onSubmit({
      supplierId: supplierId || undefined,
      supplierName: supplierId ? undefined : supplierName.trim() || undefined,
      documentNumber: String(form.get("documentNumber") || "").trim() || undefined,
      receiptNumber: String(form.get("receiptNumber") || "").trim() || undefined,
      paymentMethod,
      paidFromCash,
      notes: String(form.get("notes") || "").trim() || undefined,
      purchasedAt: String(form.get("purchasedAt") || "").trim() || undefined,
      items
    });
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={submit}>
        <div className="rounded-md border bg-muted px-3 py-2 text-sm">Total compra: <strong>{money(total)}</strong></div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <SelectField label="Proveedor registrado" value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
            <option value="">Sin proveedor registrado</option>
            {suppliers.filter((supplier) => supplier.isActive).map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </SelectField>
          <Button type="button" variant="secondary" icon={<UserPlus className="h-4 w-4" />} onClick={() => setSupplierPanelOpen((value) => !value)}>
            Nuevo proveedor
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Proveedor libre" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} disabled={Boolean(supplierId)} />
          <TextField label="Documento compra" name="documentNumber" />
          <TextField label="Comprobante" name="receiptNumber" />
          <TextField label="Fecha" name="purchasedAt" type="date" />
          <SelectField label="Metodo de pago" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
            {paymentMethods().map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
          </SelectField>
        </div>
        <CheckboxField label="Pagar desde caja" description="Si esta activo, registra egreso y exige caja abierta." checked={paidFromCash} onChange={(event) => setPaidFromCash(event.target.checked)} />

        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-2 rounded-md border p-3 lg:grid-cols-[1fr_1.2fr_100px_120px_120px_44px] lg:items-end">
              <SelectField label="Producto stock" value={line.materialId} onChange={(event) => selectMaterial(index, event.target.value)}>
                <option value="">Solo concepto</option>
                {materials.filter((material) => material.isActive).map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
              </SelectField>
              <TextField label="Concepto" value={line.description} onChange={(event) => updateLine(index, { ...line, description: event.target.value })} required />
              <TextField label="Cantidad" type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, { ...line, quantity: Number(event.target.value) })} required />
              <TextField label="Texto cant." value={line.quantityText} onChange={(event) => updateLine(index, { ...line, quantityText: event.target.value })} placeholder="100 UND" />
              <TextField label="Costo unit." type="number" min="0" step="0.01" value={line.unitCost} onChange={(event) => updateLine(index, { ...line, unitCost: Number(event.target.value) })} required />
              <Button type="button" variant="ghost" size="sm" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Quitar item">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setLines((current) => [...current, { materialId: "", description: "", quantity: 1, quantityText: "", unitCost: 0 }])}>Agregar item</Button>
        <TextareaField label="Notas" name="notes" />
        <div className="flex justify-end">
          <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar compra"}</Button>
        </div>
      </form>

      <AppModal open={supplierPanelOpen} title="Nuevo proveedor" description="Se crea aqui mismo y queda seleccionado para esta compra." size="xl" onClose={() => setSupplierPanelOpen(false)}>
        <SupplierForm compact submitLabel="Crear y usar proveedor" isSubmitting={isCreatingSupplier} onSubmit={(payload) => void createInlineSupplier(payload)} />
      </AppModal>
    </div>
  );
}


