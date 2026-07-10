import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Power } from "lucide-react";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { IconAction } from "@/components/ui/IconAction";
import { useToast } from "@/components/ui/Toast";
import { updateSupplier } from "../api/purchases.api";
import { SupplierForm } from "./SupplierForm";
import type { CreateSupplierPayload } from "../types/purchases.types";
import type { Supplier } from "../types/purchases.types";

const baseColumns: Array<DataTableColumn<Supplier>> = [
  {
    id: "supplier",
    header: "Proveedor",
    pinnedByDefault: true,
    minWidth: 240,
    cell: (supplier) => (
      <div>
        <strong className="block">{supplier.name}</strong>
        <span className="text-xs text-slate-500">{supplier.documentNumber ? `Doc. ${supplier.documentNumber}` : "Sin documento"}</span>
      </div>
    )
  },
  { id: "contact", header: "Contacto", cell: (supplier) => supplier.contactName || "-" },
  { id: "phone", header: "Telefono", cell: (supplier) => supplier.phone || "-" },
  { id: "email", header: "Correo", visibleByDefault: false, cell: (supplier) => supplier.email || "-" },
  {
    id: "location",
    header: "Ubicacion",
    minWidth: 220,
    cell: (supplier) => [supplier.department, supplier.province, supplier.district].filter(Boolean).join(" / ") || "Sin ubicacion"
  },
  { id: "address", header: "Direccion", visibleByDefault: false, minWidth: 220, cell: (supplier) => supplier.address || "-" },
  { id: "reference", header: "Referencia", visibleByDefault: false, minWidth: 220, cell: (supplier) => supplier.reference || "-" },
  {
    id: "status",
    header: "Estado",
    cell: (supplier) => (
      <span className={supplier.isActive ? "w-fit rounded-full bg-green-50 px-3 py-1 text-sm text-green-700" : "w-fit rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"}>
        {supplier.isActive ? "Activo" : "Inactivo"}
      </span>
    )
  }
];

export function SuppliersList({ suppliers, search, onSearchChange }: { suppliers: Supplier[]; search: string; onSearchChange: (value: string) => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Supplier | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSupplierPayload> }) => updateSupplier(id, payload),
    onSuccess: (_data, variables) => {
      toast({ tone: "success", message: variables.payload.isActive !== undefined ? "Estado del proveedor actualizado." : "Proveedor actualizado." });
      setEditTarget(null);
      setToggleTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: () => toast({ tone: "error", message: "No se pudo actualizar el proveedor. Revisa nombre duplicado." })
  });

  const columns = useMemo<Array<DataTableColumn<Supplier>>>(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "Acciones",
      cell: (supplier) => (
        <div className="flex gap-1.5">
          <IconAction label="Editar proveedor" icon={<Pencil />} tone="edit" variant="outline" size="sm" onClick={() => setEditTarget(supplier)} />
          <IconAction
            label={supplier.isActive ? "Desactivar proveedor" : "Activar proveedor"}
            icon={<Power />}
            tone={supplier.isActive ? "danger" : "success"}
            variant="outline"
            size="sm"
            onClick={() => setToggleTarget(supplier)}
          />
        </div>
      )
    }
  ], []);

  const filtered = suppliers.filter((supplier) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [supplier.name, supplier.documentNumber, supplier.contactName, supplier.phone, supplier.email, supplier.district]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

  return (
    <>
    <DataTable
      storageKey="novalink.suppliers.table"
      title="Proveedores"
      description="Datos comerciales, contacto y ubicacion."
      data={filtered}
      columns={columns}
      getRowId={(supplier) => supplier.id}
      emptyMessage="No hay proveedores para mostrar."
      minWidth={980}
      toolbar={
        <input
          className="h-10 w-full rounded-lg border px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-80"
          placeholder="Buscar proveedor, RUC/DNI, contacto..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      }
    />

    <AppModal
      open={editTarget !== null}
      size="lg"
      title="Editar proveedor"
      description={editTarget?.name}
      onClose={() => setEditTarget(null)}
    >
      {editTarget ? (
        <SupplierForm
          key={editTarget.id}
          isSubmitting={updateMutation.isPending}
          submitLabel="Actualizar proveedor"
          compact
          initialValues={{
            name: editTarget.name,
            documentNumber: editTarget.documentNumber ?? "",
            contactName: editTarget.contactName ?? "",
            phone: editTarget.phone ?? "",
            email: editTarget.email ?? "",
            country: editTarget.country ?? "PE",
            department: editTarget.department ?? "",
            province: editTarget.province ?? "",
            district: editTarget.district ?? "",
            address: editTarget.address ?? "",
            reference: editTarget.reference ?? "",
            notes: editTarget.notes ?? "",
            isActive: editTarget.isActive
          }}
          onSubmit={(payload) => updateMutation.mutate({ id: editTarget.id, payload })}
        />
      ) : null}
    </AppModal>

    <AppModal
      open={toggleTarget !== null}
      size="sm"
      title={toggleTarget?.isActive ? "Desactivar proveedor" : "Activar proveedor"}
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
          ? "El proveedor dejara de aparecer al registrar compras nuevas. Su historial se conserva."
          : "El proveedor volvera a estar disponible al registrar compras."}
      </p>
    </AppModal>
    </>
  );
}

