import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { DataLoader } from "@/components/ui/DataLoader";
import { TextField, TextareaField } from "@/components/ui/FormControls";
import { MiniSwitch } from "@/components/ui/ToggleControls";
import { useToast } from "@/components/ui/Toast";
import { createAdminRole, fetchAdminPermissions, fetchAdminRoles, updateAdminRole } from "../api/admin.api";

/** Agrupa codigos de permiso por su modulo (prefijo antes del primer punto). */
function groupPermissions(codes: string[]) {
  const groups = new Map<string, string[]>();
  codes.forEach((code) => {
    const [prefix] = code.split(".");
    groups.set(prefix, [...(groups.get(prefix) ?? []), code]);
  });
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function RolPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const isEditing = Boolean(roleId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: fetchAdminRoles });
  const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: fetchAdminPermissions });

  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });
  const [loaded, setLoaded] = useState(false);

  const role = isEditing ? (rolesQuery.data ?? []).find((item) => item.id === roleId) : undefined;
  const permissionCodes = (permissionsQuery.data ?? []).map((permission) => permission.code);

  useEffect(() => {
    if (!isEditing || loaded || !role) return;
    setForm({ name: role.name, description: role.description ?? "", permissions: role.permissions });
    setLoaded(true);
  }, [isEditing, loaded, role]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name.trim(), description: form.description.trim() || undefined, permissions: form.permissions };
      if (isEditing && role) return updateAdminRole(role.id, payload);
      return createAdminRole(payload);
    },
    onSuccess: () => {
      toast({ tone: "success", message: isEditing ? "Rol actualizado." : "Rol creado." });
      void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      navigate("/administracion");
    },
    onError: () => toast({ tone: "error", message: "No se pudo guardar el rol. Revisa nombre duplicado." })
  });

  function toggle(code: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(code)
        ? current.permissions.filter((item) => item !== code)
        : [...current.permissions, code]
    }));
  }

  if (isEditing && rolesQuery.isLoading) return <DataLoader label="Cargando rol..." />;
  if (isEditing && !rolesQuery.isLoading && !role) {
    return (
      <section className="space-y-4">
        <BackButton to="/administracion" label="Administracion" />
        <div className="rounded-lg border bg-background p-6 text-sm text-slate-500">Rol no encontrado.</div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <BackButton to="/administracion" label="Administracion" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h1 className="text-2xl font-semibold">{isEditing ? `Editar rol: ${role?.name ?? ""}` : "Nuevo rol"}</h1>
          </div>
          <p className="text-sm text-slate-500">Define los permisos por modulo y accion. {form.permissions.length} permiso(s) seleccionados.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={saveMutation.isPending} onClick={() => navigate("/administracion")}>Cancelar</Button>
          <Button type="button" icon={<Save className="h-4 w-4" />} disabled={saveMutation.isPending || !form.name.trim()} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? "Guardando..." : isEditing ? "Actualizar rol" : "Crear rol"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-[16rem_1fr]">
        <TextField label="Nombre" hint="Se guarda en mayusculas, ej. COBRADOR" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <TextareaField label="Descripcion" className="min-h-10" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
      </div>

      {permissionsQuery.isLoading ? <DataLoader label="Cargando permisos..." /> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groupPermissions(permissionCodes).map(([prefix, codes]) => {
          const activeCount = codes.filter((code) => form.permissions.includes(code)).length;
          const allActive = activeCount === codes.length;
          return (
            <section key={prefix} className="overflow-hidden rounded-lg border bg-background">
              <div className="flex items-center justify-between gap-3 border-b bg-table-head px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{prefix}</span>
                <MiniSwitch
                  label={allActive ? "Todo" : `${activeCount}/${codes.length}`}
                  checked={allActive}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      permissions: allActive
                        ? current.permissions.filter((code) => !codes.includes(code))
                        : Array.from(new Set([...current.permissions, ...codes]))
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5 px-3 py-2.5">
                {codes.map((code) => (
                  <div key={code} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs text-slate-600">{code.slice(prefix.length + 1) || code}</span>
                    <MiniSwitch label="" checked={form.permissions.includes(code)} onChange={() => toggle(code)} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
