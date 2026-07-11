import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { DataLoader } from "@/components/ui/DataLoader";
import { SelectField, TextField } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { CartDropZone, CartItemCard, CatalogCard, CatalogSearch, PosLayout, TrashZone } from "@/components/pos/pos-primitives";
import { emptyPayments, isCashPayment, PaymentSplit, type PaymentsState, primaryMethod } from "@/components/pos/PaymentSplit";
import type { Material } from "@/modules/productos/types/products.types";
import { createPurchase, fetchPurchaseMaterials, fetchSuppliers } from "../api/purchases.api";
import { money } from "@/lib/format";

type CartLine = { key: string; material: Material; unitCost: number; quantity: number };


function CompraCard({ material, onAdd }: { material: Material; onAdd: (line: Omit<CartLine, "key">) => void }) {
  const [unitCost, setUnitCost] = useState(material.costPrice ?? 0);
  const [quantity, setQuantity] = useState(1);

  return (
    <CatalogCard
      imageUrl={material.imageUrl}
      name={material.name}
      meta={`${material.sku || "Sin SKU"} · Stock ${material.stock} ${material.unit}`}
      addLabel="Agregar"
      dragMaterialId={material.id}
      onAdd={() => onAdd({ material, unitCost, quantity })}
    >
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Costo S/" type="number" min={0} step="0.01" value={unitCost} onChange={(event) => setUnitCost(Math.max(0, Number(event.target.value)))} />
        <TextField label="Cant." type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} />
      </div>
    </CatalogCard>
  );
}

export function CompraNuevaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [payments, setPayments] = useState<PaymentsState>(emptyPayments);
  const [dropActive, setDropActive] = useState(false);

  const materialsQuery = useQuery({ queryKey: ["materials", "compras"], queryFn: fetchPurchaseMaterials });
  const suppliersQuery = useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });

  const catalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (materialsQuery.data ?? [])
      .filter((material) => material.isActive)
      .filter((material) => (term ? `${material.name} ${material.sku ?? ""}`.toLowerCase().includes(term) : true));
  }, [materialsQuery.data, search]);

  const total = cart.reduce((sum, line) => sum + line.unitCost * line.quantity, 0);

  const purchaseMutation = useMutation({
    mutationFn: () =>
      createPurchase({
        supplierId: supplierId || undefined,
        receiptNumber: receiptNumber || undefined,
        paymentMethod: primaryMethod(payments),
        paidFromCash: isCashPayment(payments),
        items: cart.map((line) => ({
          materialId: line.material.id,
          description: line.material.name,
          quantity: line.quantity,
          unitCost: line.unitCost
        }))
      }),
    onSuccess: () => {
      toast({ tone: "success", message: "Compra registrada; stock actualizado." });
      void queryClient.invalidateQueries({ queryKey: ["material-purchases"] });
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
      navigate("/compras");
    },
    onError: () => toast({ tone: "error", message: "No se pudo registrar. Si se paga de caja, verifica que haya caja abierta." })
  });

  function addToCart(line: Omit<CartLine, "key">) {
    setCart((current) => {
      const existing = current.find((item) => item.material.id === line.material.id && item.unitCost === line.unitCost);
      if (existing) {
        return current.map((item) => (item === existing ? { ...item, quantity: item.quantity + line.quantity } : item));
      }
      return [...current, { ...line, key: crypto.randomUUID() }];
    });
  }

  function removeLine(key: string) {
    setCart((current) => current.filter((line) => line.key !== key));
  }

  function addByMaterialId(materialId: string) {
    const material = (materialsQuery.data ?? []).find((item) => item.id === materialId);
    if (!material) return;
    addToCart({ material, unitCost: material.costPrice ?? 0, quantity: 1 });
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <BackButton to="/compras" label="Volver a compras" />
        <h1 className="text-2xl font-semibold">Nueva compra</h1>
      </div>

      <PosLayout
        catalog={
          <>
            <CatalogSearch value={search} onChange={setSearch} placeholder="Buscar producto por nombre o SKU" />
            {materialsQuery.isLoading ? (
              <DataLoader />
            ) : catalog.length === 0 ? (
              <div className="rounded-lg border bg-background p-6 text-sm text-slate-500">No hay productos.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {catalog.map((material) => (
                  <CompraCard key={material.id} material={material} onAdd={addToCart} />
                ))}
              </div>
            )}
          </>
        }
        panel={
          <div className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex items-center gap-2 border-b pb-2">
              <PackagePlus className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Compra</h2>
              <span className="ml-auto text-sm text-slate-500">{cart.length} item(s)</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <SelectField label="Proveedor" value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                <option value="">Sin proveedor</option>
                {(suppliersQuery.data ?? []).map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </SelectField>
              <TextField label="N° comprobante" value={receiptNumber} onChange={(event) => setReceiptNumber(event.target.value)} />
            </div>

            <div className="mt-3">
              <PaymentSplit payments={payments} onChange={setPayments} total={total} />
            </div>

            <div className="mt-3">
              <TrashZone onDropKey={removeLine} />
            </div>

            <CartDropZone className="mt-3" onDropMaterialId={addByMaterialId}>
              {cart.length === 0 ? (
                <p className="px-3 py-5 text-center text-sm text-slate-500">Agrega o arrastra productos aqui.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
                  {cart.map((line) => (
                    <CartItemCard
                      key={line.key}
                      dragKey={line.key}
                      imageUrl={line.material.imageUrl}
                      name={line.material.name}
                      detail={`${line.quantity} × ${money(line.unitCost)}`}
                      amount={money(line.unitCost * line.quantity)}
                      onRemove={() => removeLine(line.key)}
                    />
                  ))}
                </div>
              )}
            </CartDropZone>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-sm text-slate-500">Total</span>
              <strong className="text-lg">{money(total)}</strong>
            </div>

            <Button className="mt-3 w-full" type="button" icon={<PackagePlus className="h-4 w-4" />} disabled={cart.length === 0 || purchaseMutation.isPending} onClick={() => purchaseMutation.mutate()}>
              Registrar compra
            </Button>
          </div>
        }
      />
    </section>
  );
}




