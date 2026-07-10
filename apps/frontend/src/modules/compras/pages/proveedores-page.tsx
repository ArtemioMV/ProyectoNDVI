import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Truck } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { AppModal } from "@/components/ui/AppModal";
import { MetricCard } from "@/components/ui/Panels";
import { createSupplier, fetchSuppliers } from "../api/purchases.api";
import { SupplierForm } from "../components/SupplierForm";
import { SuppliersList } from "../components/SuppliersList";
import type { CreateSupplierPayload } from "../types/purchases.types";

export function ProveedoresPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const suppliersQuery = useQuery({ queryKey: ["suppliers"], queryFn: fetchSuppliers });
  const suppliers = suppliersQuery.data ?? [];

  const supplierMutation = useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      setFeedback("Proveedor creado correctamente.");
      setCreateOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => setFeedback("No se pudo crear el proveedor. Revisa si el nombre ya existe o si faltan datos.")
  });

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <BackButton to="/compras" label="Volver a compras" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Proveedores</h1>
            <p className="text-sm text-slate-500">Registro completo de proveedores para compras, documentos y ubicacion.</p>
          </div>
          <Button type="button" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>Crear proveedor</Button>
        </div>
      </div>

      {feedback ? <div className="rounded-md border bg-background px-3 py-2 text-sm text-slate-700">{feedback}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Proveedores" value={suppliers.length} icon={<Truck className="h-4 w-4" />} />
        <MetricCard label="Activos" value={suppliers.filter((supplier) => supplier.isActive).length} icon={<Truck className="h-4 w-4" />} tone="success" />
        <MetricCard label="Con ubicacion" value={suppliers.filter((supplier) => supplier.district || supplier.address).length} icon={<Truck className="h-4 w-4" />} />
      </div>

      <AppModal open={createOpen} title="Crear proveedor" description="Datos, documento, contacto y ubicacion como cliente." size="xl" onClose={() => setCreateOpen(false)}>
        <SupplierForm isSubmitting={supplierMutation.isPending} onSubmit={(payload) => supplierMutation.mutate(payload)} />
      </AppModal>

      <SuppliersList suppliers={suppliers} search={search} onSearchChange={setSearch} />
    </section>
  );
}

