import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Power, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { IconAction } from "@/components/ui/IconAction";
import { useToast } from "@/components/ui/Toast";
import { updateMaterial } from "../api/products.api";
import { MaterialForm } from "./MaterialForm";
import type { CreateMaterialPayload, Material } from "../types/products.types";
import { money } from "@/lib/format";

type MaterialsTableProps = {
  materials: Material[];
  search: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
};


const baseColumns: Array<DataTableColumn<Material>> = [
  {
    id: "material",
    header: "Material",
    pinnedByDefault: true,
    minWidth: 240,
    cell: (material) => (
      <div>
        <strong className="block">{material.name}</strong>
        <span className="text-xs text-slate-500">{material.sku || "Sin SKU"}</span>
      </div>
    )
  },
  { id: "unit", header: "Unidad", cell: (material) => material.unit },
  {
    id: "stock",
    header: "Stock",
    cell: (material) => <span className={material.isLowStock ? "font-semibold text-red-600" : "font-semibold"}>{material.stock}</span>
  },
  {
    id: "minStock",
    header: "Stock minimo",
    cell: (material) => <span className="font-medium">{material.minStock}</span>
  },
  {
    id: "cost",
    header: "Ultimo costo",
    visibleByDefault: false,
    cell: (material) => (material.costPrice === null || material.costPrice === undefined ? "-" : money(material.costPrice))
  },
  { id: "sale", header: "Venta", cell: (material) => money(material.salePrice) },
  {
    id: "installPrice",
    header: "Instalacion",
    visibleByDefault: false,
    cell: (material) => (material.installPrice === null || material.installPrice === undefined ? "-" : money(material.installPrice))
  },
  {
    id: "installationMaterial",
    header: "Uso",
    visibleByDefault: false,
    cell: (material) => (material.isInstallationMaterial ? "Instalacion" : "Venta/stock")
  },
  {
    id: "status",
    header: "Estado",
    cell: (material) => (
      <span className={material.isActive ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"}>
        {material.isActive ? "Activo" : "Inactivo"}
      </span>
    )
  }
];

export function MaterialsTable({ materials, search, isLoading, onSearchChange }: MaterialsTableProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editTarget, setEditTarget] = useState<Material | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Material | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateMaterialPayload> & { isActive?: boolean } }) => updateMaterial(id, payload),
    onSuccess: (_data, variables) => {
      toast({ tone: "success", message: variables.payload.isActive !== undefined ? "Estado del producto actualizado." : "Producto actualizado." });
      setEditTarget(null);
      setToggleTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
      void queryClient.invalidateQueries({ queryKey: ["installation-materials"] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo actualizar el producto. Revisa SKU o nombre duplicado." })
  });

  const columns = useMemo<Array<DataTableColumn<Material>>>(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "Acciones",
      cell: (material) => (
        <div className="flex gap-1.5">
          <IconAction label="Editar producto" icon={<Pencil />} tone="edit" variant="outline" size="sm" onClick={() => setEditTarget(material)} />
          <IconAction
            label={material.isActive ? "Desactivar producto" : "Activar producto"}
            icon={<Power />}
            tone={material.isActive ? "danger" : "success"}
            variant="outline"
            size="sm"
            onClick={() => setToggleTarget(material)}
          />
        </div>
      )
    }
  ], []);

  return (
    <>
    <DataTable
      storageKey="novalink.materials.table.v2"
      title="Materiales"
      description="Catalogo, precios de venta y control de stock. El costo se actualiza desde Compras."
      data={materials}
      columns={columns}
      getRowId={(material) => material.id}
      isLoading={isLoading}
      emptyMessage="No hay materiales registrados."
      minWidth={960}
      toolbar={
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Buscar por nombre o SKU" value={search} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
      }
    />

    <AppModal
      open={editTarget !== null}
      size="lg"
      title="Editar producto"
      description={editTarget?.name}
      onClose={() => setEditTarget(null)}
    >
      {editTarget ? (
        <MaterialForm
          key={editTarget.id}
          isSubmitting={updateMutation.isPending}
          submitLabel="Actualizar producto"
          initialValues={{
            sku: editTarget.sku ?? "",
            name: editTarget.name,
            description: editTarget.description ?? "",
            unit: editTarget.unit,
            salePrice: editTarget.salePrice,
            coveragePrice: editTarget.coveragePrice ?? 0,
            installPrice: editTarget.installPrice ?? 0,
            imageUrl: editTarget.imageUrl ?? "",
            minStock: editTarget.minStock,
            manageStock: editTarget.minStock > 0,
            isInstallationMaterial: editTarget.isInstallationMaterial
          }}
          onSubmit={(payload) => updateMutation.mutate({ id: editTarget.id, payload })}
        />
      ) : null}
    </AppModal>

    <AppModal
      open={toggleTarget !== null}
      size="sm"
      title={toggleTarget?.isActive ? "Desactivar producto" : "Activar producto"}
      description={toggleTarget?.name}
      onClose={() => setToggleTarget(null)}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={updateMutation.isPending} onClick={() => setToggleTarget(null)}>Volver</Button>
          <Button
            type="button"
            variant={toggleTarget?.isActive ? "danger" : "primary"}
            disabled={updateMutation.isPending}
            onClick={() => toggleTarget && updateMutation.mutate({ id: toggleTarget.id, payload: { isActive: !toggleTarget.isActive } })}
          >
            {updateMutation.isPending ? "Aplicando..." : toggleTarget?.isActive ? "Desactivar" : "Activar"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-600">
        {toggleTarget?.isActive
          ? "El producto dejara de aparecer en ventas y compras nuevas. El stock y el historial se conservan."
          : "El producto volvera a estar disponible en ventas y compras."}
      </p>
    </AppModal>
    </>
  );
}
