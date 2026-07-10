import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { DataLoader } from "@/components/ui/DataLoader";
import { TextField } from "@/components/ui/FormControls";
import { useToast } from "@/components/ui/Toast";
import { CartItemCard, CatalogCard, CatalogSearch, PosLayout, TrashZone } from "@/components/pos/pos-primitives";
import { emptyPayments, PaymentSplit, type PaymentsState, primaryMethod } from "@/components/pos/PaymentSplit";
import type { Material } from "@/modules/productos/types/products.types";
import { createMaterialSale, fetchSaleMaterials } from "../api/sales.api";
import { money } from "@/lib/format";

type PriceType = "SALE" | "COVERAGE" | "INSTALL";
type PriceOption = { type: PriceType; label: string; value: number };
type CartLine = { key: string; material: Material; priceType: PriceType; unitPrice: number; quantity: number; discount: number };


function priceOptions(material: Material): PriceOption[] {
  const opts: PriceOption[] = [{ type: "SALE", label: "Venta", value: material.salePrice }];
  if (material.coveragePrice != null) opts.push({ type: "COVERAGE", label: "Cobertura", value: material.coveragePrice });
  if (material.installPrice != null) opts.push({ type: "INSTALL", label: "Instalacion", value: material.installPrice });
  return opts;
}

function VentaCard({ material, onAdd }: { material: Material; onAdd: (line: Omit<CartLine, "key">) => void }) {
  const options = priceOptions(material);
  const [priceType, setPriceType] = useState<PriceType>("SALE");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const selected = options.find((option) => option.type === priceType) ?? options[0];
  const outOfStock = material.stock <= 0;

  return (
    <CatalogCard
      imageUrl={material.imageUrl}
      name={material.name}
      meta={`${material.sku || "Sin SKU"} · Stock ${material.stock} ${material.unit}`}
      disabled={outOfStock}
      addLabel={outOfStock ? "Sin stock" : "Agregar"}
      dragMaterialId={outOfStock ? undefined : material.id}
      onAdd={() => onAdd({ material, priceType, unitPrice: selected.value, quantity, discount })}
    >
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => setPriceType(option.type)}
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium transition",
              option.type === priceType ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "text-slate-600 hover:bg-muted"
            )}
          >
            {money(option.value)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Cant." type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} />
        <TextField label="Desc. S/" type="number" min={0} step="0.01" value={discount} onChange={(event) => setDiscount(Math.max(0, Number(event.target.value)))} />
      </div>
      {options.length > 1 ? <p className="text-xs text-slate-400">{selected.label}</p> : null}
    </CatalogCard>
  );
}

export function VentaNuevaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [payments, setPayments] = useState<PaymentsState>(emptyPayments);

  const materialsQuery = useQuery({ queryKey: ["materials", "ventas"], queryFn: fetchSaleMaterials });

  const catalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (materialsQuery.data ?? [])
      .filter((material) => material.isActive)
      .filter((material) => (term ? `${material.name} ${material.sku ?? ""}`.toLowerCase().includes(term) : true));
  }, [materialsQuery.data, search]);

  const total = cart.reduce((sum, line) => sum + Math.max(0, line.unitPrice * line.quantity - line.discount), 0);
  const totalDiscount = cart.reduce((sum, line) => sum + line.discount, 0);

  const saleMutation = useMutation({
    mutationFn: () =>
      createMaterialSale({
        customerName: customerName || undefined,
        documentNumber: documentNumber || undefined,
        paymentMethod: primaryMethod(payments),
        discountAmount: totalDiscount || undefined,
        items: cart.map((line) => ({ materialId: line.material.id, quantity: line.quantity }))
      }),
    onSuccess: () => {
      toast({ tone: "success", message: "Venta registrada y sumada a caja." });
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
      void queryClient.invalidateQueries({ queryKey: ["material-sales"] });
      void queryClient.invalidateQueries({ queryKey: ["cash-register"] });
      navigate("/ventas");
    },
    onError: () => toast({ tone: "error", message: "No se pudo registrar. Revisa stock y que haya caja abierta." })
  });

  function addToCart(line: Omit<CartLine, "key">) {
    setCart((current) => {
      const existing = current.find((item) => item.material.id === line.material.id && item.priceType === line.priceType);
      if (existing) {
        return current.map((item) => (item === existing ? { ...item, quantity: item.quantity + line.quantity, discount: item.discount + line.discount } : item));
      }
      return [...current, { ...line, key: crypto.randomUUID() }];
    });
  }

  function removeLine(key: string) {
    setCart((current) => current.filter((line) => line.key !== key));
  }

  // Arrastrar una tarjeta del catalogo a la lista: se inserta con el precio de cobertura.
  function addByMaterialId(materialId: string) {
    const material = (materialsQuery.data ?? []).find((item) => item.id === materialId);
    if (!material || material.stock <= 0) return;
    const price = material.coveragePrice ?? material.salePrice;
    addToCart({ material, priceType: material.coveragePrice != null ? "COVERAGE" : "SALE", unitPrice: price, quantity: 1, discount: 0 });
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <BackButton to="/ventas" label="Volver a ventas" />
        <h1 className="text-2xl font-semibold">Nueva venta</h1>
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
              <div
                className="grid grid-cols-2 gap-3 xl:grid-cols-3"
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  const key = event.dataTransfer.getData("text/plain");
                  if (key) removeLine(key);
                }}
              >
                {catalog.map((material) => (
                  <VentaCard key={material.id} material={material} onAdd={addToCart} />
                ))}
              </div>
            )}
          </>
        }
        panel={
          <div className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex items-center gap-2 border-b pb-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Venta</h2>
              <span className="ml-auto text-sm text-slate-500">{cart.length} item(s)</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <TextField label="Cliente" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
              <TextField label="Documento" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} />
            </div>

            <div className="mt-3">
              <PaymentSplit payments={payments} onChange={setPayments} total={total} />
            </div>

            <div className="mt-3">
              <TrashZone onDropKey={removeLine} />
            </div>

            <div
              className="mt-3 max-h-52 overflow-y-auto"
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                const id = event.dataTransfer.getData("application/x-add-material");
                if (id) addByMaterialId(id);
              }}
            >
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500">Agrega o arrastra productos aqui.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {cart.map((line) => (
                    <CartItemCard
                      key={line.key}
                      dragKey={line.key}
                      imageUrl={line.material.imageUrl}
                      name={line.material.name}
                      detail={`${line.quantity} × ${money(line.unitPrice)}${line.discount > 0 ? ` − ${money(line.discount)}` : ""}`}
                      amount={money(Math.max(0, line.unitPrice * line.quantity - line.discount))}
                      onRemove={() => removeLine(line.key)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-sm text-slate-500">Total</span>
              <strong className="text-lg">{money(total)}</strong>
            </div>

            <Button className="mt-3 w-full" type="button" icon={<ShoppingCart className="h-4 w-4" />} disabled={cart.length === 0 || saleMutation.isPending} onClick={() => saleMutation.mutate()}>
              Registrar venta
            </Button>
          </div>
        }
      />
    </section>
  );
}



