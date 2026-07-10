import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownUp, Boxes, PackageCheck, PackagePlus, ShoppingCart, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/ChoiceControls";
import { DisclosurePanel, MetricCard } from "@/components/ui/Panels";
import { createMaterial, createMaterialMovement, fetchMaterials } from "../api/products.api";
import { MaterialForm } from "../components/MaterialForm";
import { MaterialsTable } from "../components/MaterialsTable";
import { StockMovementForm } from "../components/StockMovementForm";
import type { CreateMaterialMovementPayload, CreateMaterialPayload } from "../types/products.types";
import { money } from "@/lib/format";

type ProductsTab = "catalog" | "movements" | "alerts";

const productTabs: Array<{ value: ProductsTab; label: string }> = [
  { value: "catalog", label: "Catalogo" },
  { value: "movements", label: "Movimientos" },
  { value: "alerts", label: "Stock bajo" }
];


export function ProductosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ProductsTab>("catalog");
  const [createOpen, setCreateOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const materialsQuery = useQuery({
    queryKey: ["materials", search],
    queryFn: () => fetchMaterials(search)
  });

  const materials = materialsQuery.data ?? [];
  const activeMaterials = materials.filter((material) => material.isActive);
  const lowStockMaterials = materials.filter((material) => material.isLowStock);
  const summary = useMemo(() => {
    const inventoryValue = materials.reduce((sum, material) => sum + material.stock * material.salePrice, 0);
    const units = materials.reduce((sum, material) => sum + material.stock, 0);
    return { inventoryValue, units };
  }, [materials]);

  function refreshInventory() {
    void queryClient.invalidateQueries({ queryKey: ["materials"] });
  }

  const createMaterialMutation = useMutation({
    mutationFn: (payload: CreateMaterialPayload) => createMaterial(payload),
    onSuccess: () => {
      setFeedback("Producto creado correctamente.");
      setCreateOpen(false);
      refreshInventory();
    },
    onError: () => setFeedback("No se pudo crear el producto. Revisa SKU, nombre o datos obligatorios.")
  });

  const movementMutation = useMutation({
    mutationFn: ({ materialId, payload }: { materialId: string; payload: CreateMaterialMovementPayload }) => createMaterialMovement(materialId, payload),
    onSuccess: () => {
      setFeedback("Movimiento registrado correctamente.");
      setMovementOpen(false);
      refreshInventory();
    },
    onError: () => setFeedback("No se pudo registrar el movimiento. Verifica stock disponible y datos ingresados.")
  });

  function openCreatePanel() {
    setActiveTab("catalog");
    setCreateOpen(true);
  }

  function openMovementPanel() {
    setActiveTab("movements");
    setMovementOpen(true);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-slate-500">Catalogo y control de stock. Compras y ventas viven en sus propios modulos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" icon={<PackagePlus className="h-4 w-4" />} onClick={openCreatePanel}>Crear producto</Button>
          <Button type="button" variant="secondary" icon={<ArrowDownUp className="h-4 w-4" />} onClick={openMovementPanel}>Movimiento</Button>
        </div>
      </div>

      {feedback ? <div className="rounded-md border bg-background px-3 py-2 text-sm text-slate-700">{feedback}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Productos activos" value={activeMaterials.length} icon={<Boxes className="h-4 w-4" />} />
        <MetricCard label="Unidades en stock" value={summary.units} icon={<PackageCheck className="h-4 w-4" />} />
        <MetricCard label="Bajo minimo" value={lowStockMaterials.length} icon={<TriangleAlert className="h-4 w-4" />} tone={lowStockMaterials.length > 0 ? "warning" : "neutral"} />
        <MetricCard label="Valor venta stock" value={money(summary.inventoryValue)} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      <SegmentedControl value={activeTab} options={productTabs} onChange={setActiveTab} />

      {activeTab === "catalog" ? (
        <div className="space-y-4">
          <DisclosurePanel title="Crear producto" description="Abre este panel solo cuando vas a registrar un producto nuevo." open={createOpen} onToggle={() => setCreateOpen((open) => !open)}>
            <MaterialForm isSubmitting={createMaterialMutation.isPending} onSubmit={(payload) => createMaterialMutation.mutate(payload)} />
          </DisclosurePanel>
          <MaterialsTable materials={materials} search={search} isLoading={materialsQuery.isLoading} onSearchChange={setSearch} />
        </div>
      ) : null}

      {activeTab === "movements" ? (
        <div className="space-y-4">
          <DisclosurePanel title="Registrar movimiento" description="Instalacion, reposicion, devolucion o ajuste de stock." open={movementOpen} onToggle={() => setMovementOpen((open) => !open)}>
            <StockMovementForm
              materials={materials}
              isSubmitting={movementMutation.isPending}
              onSubmit={(materialId, payload) => movementMutation.mutate({ materialId, payload })}
            />
          </DisclosurePanel>
          <div className="rounded-lg border bg-background p-4 text-sm text-slate-500">
            Las compras con costo se registran desde Compras. Aqui se registran ajustes y salidas operativas de stock.
          </div>
        </div>
      ) : null}

      {activeTab === "alerts" ? (
        <div className="overflow-hidden rounded-lg border bg-background">
          <div className="border-b p-4">
            <h2 className="font-semibold">Productos bajo minimo</h2>
            <p className="text-sm text-slate-500">Prioriza compras desde el modulo Compras antes de instalaciones y ventas.</p>
          </div>
          {lowStockMaterials.length === 0 ? <div className="p-6 text-sm text-slate-500">No hay productos bajo minimo.</div> : null}
          <div className="divide-y">
            {lowStockMaterials.map((material) => (
              <article key={material.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <strong>{material.name}</strong>
                  <p className="text-sm text-slate-500">SKU {material.sku || "sin SKU"} - minimo {material.minStock}</p>
                </div>
                <span className="rounded-full bg-red-50 px-2 py-1 text-sm font-medium text-red-700">Stock {material.stock}</span>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
