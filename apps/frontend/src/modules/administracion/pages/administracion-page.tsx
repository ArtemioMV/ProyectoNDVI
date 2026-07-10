import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Power, ShieldCheck, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { TextField, TextareaField } from "@/components/ui/FormControls";
import { IconAction } from "@/components/ui/IconAction";
import { CustomerStatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  createAdminRole,
  createAdminUser,
  fetchAdminPermissions,
  fetchAdminRoles,
  fetchAdminUsers,
  updateAdminRole,
  updateAdminUser,
  type AdminRole,
  type AdminUser,
  type SaveRolePayload,
  type SaveUserPayload
} from "../api/admin.api";
import { shortDate } from "@/lib/format";

/** Agrupa codigos de permiso por su modulo (prefijo antes del primer punto). */
function groupPermissions(codes: string[]) {
  const groups = new Map<string, string[]>();
  codes.forEach((code) => {
    const [prefix] = code.split(".");
    groups.set(prefix, [...(groups.get(prefix) ?? []), code]);
  });
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

const emptyUserForm = { username: "", password: "", roles: [] as string[], isActive: true };
const emptyRoleForm = { name: "", description: "", permissions: [] as string[] };

export function AdministracionPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers });
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: fetchAdminRoles });
  const permissionsQuery = useQuery({ queryKey: ["admin-permissions"], queryFn: fetchAdminPermissions });

  const [userModal, setUserModal] = useState<{ mode: "create" } | { mode: "edit"; user: AdminUser } | null>(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [toggleUser, setToggleUser] = useState<AdminUser | null>(null);
  const [roleModal, setRoleModal] = useState<{ mode: "create" } | { mode: "edit"; role: AdminRole } | null>(null);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);

  const roleNames = (rolesQuery.data ?? []).map((role) => role.name);
  const permissionCodes = (permissionsQuery.data ?? []).map((permission) => permission.code);

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
  }

  const userMutation = useMutation({
    mutationFn: async () => {
      const payload: SaveUserPayload = { roles: userForm.roles, isActive: userForm.isActive };
      if (userModal?.mode === "edit") {
        if (userForm.password.trim()) payload.password = userForm.password;
        return updateAdminUser(userModal.user.id, payload);
      }
      return createAdminUser({ ...payload, username: userForm.username.trim(), password: userForm.password });
    },
    onSuccess: () => {
      toast({ tone: "success", message: userModal?.mode === "edit" ? "Usuario actualizado." : "Usuario creado." });
      setUserModal(null);
      invalidate();
    },
    onError: () => toast({ tone: "error", message: "No se pudo guardar el usuario. Revisa nombre duplicado o contrasena (minimo 8)." })
  });

  const toggleUserMutation = useMutation({
    mutationFn: (user: AdminUser) => updateAdminUser(user.id, { isActive: !user.isActive }),
    onSuccess: (_data, user) => {
      toast({ tone: "success", message: user.isActive ? "Usuario desactivado." : "Usuario activado." });
      setToggleUser(null);
      invalidate();
    },
    onError: () => toast({ tone: "error", message: "No se pudo cambiar el estado del usuario." })
  });

  const roleMutation = useMutation({
    mutationFn: async () => {
      const payload: SaveRolePayload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || undefined,
        permissions: roleForm.permissions
      };
      if (roleModal?.mode === "edit") return updateAdminRole(roleModal.role.id, payload);
      return createAdminRole({ ...payload, name: roleForm.name.trim() });
    },
    onSuccess: () => {
      toast({ tone: "success", message: roleModal?.mode === "edit" ? "Rol actualizado." : "Rol creado." });
      setRoleModal(null);
      invalidate();
    },
    onError: () => toast({ tone: "error", message: "No se pudo guardar el rol. Revisa nombre duplicado." })
  });

  function openCreateUser() {
    setUserForm(emptyUserForm);
    setUserModal({ mode: "create" });
  }

  function openEditUser(user: AdminUser) {
    setUserForm({ username: user.username, password: "", roles: user.roles, isActive: user.isActive });
    setUserModal({ mode: "edit", user });
  }

  function openCreateRole() {
    setRoleForm(emptyRoleForm);
    setRoleModal({ mode: "create" });
  }

  function openEditRole(role: AdminRole) {
    setRoleForm({ name: role.name, description: role.description ?? "", permissions: role.permissions });
    setRoleModal({ mode: "edit", role });
  }

  function toggleInList(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  const userColumns = useMemo<Array<DataTableColumn<AdminUser>>>(() => [
    {
      id: "username",
      header: "Usuario",
      pinnedByDefault: true,
      minWidth: 180,
      cell: (user) => <strong>{user.username}</strong>
    },
    {
      id: "roles",
      header: "Roles",
      minWidth: 220,
      cell: (user) => user.roles.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span key={role} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{role}</span>
          ))}
        </div>
      ) : <span className="text-slate-400">Sin roles</span>
    },
    {
      id: "status",
      header: "Estado",
      cell: (user) => <CustomerStatusBadge status={user.isActive ? "ACTIVE" : "CANCELLED"} />
    },
    { id: "created", header: "Creado", cell: (user) => shortDate(user.createdAt) },
    {
      id: "actions",
      header: "Acciones",
      cell: (user) => (
        <div className="flex gap-1.5">
          <IconAction label="Editar usuario" icon={<Pencil />} tone="edit" variant="outline" size="sm" onClick={() => openEditUser(user)} />
          <IconAction
            label={user.isActive ? "Desactivar usuario" : "Activar usuario"}
            icon={<Power />}
            tone={user.isActive ? "danger" : "success"}
            variant="outline"
            size="sm"
            onClick={() => setToggleUser(user)}
          />
        </div>
      )
    }
  ], []);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Administracion</h1>
          <p className="text-sm text-slate-500">Usuarios del panel, roles y permisos por modulo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" icon={<ShieldCheck className="h-4 w-4" />} onClick={openCreateRole}>Nuevo rol</Button>
          <Button type="button" icon={<UserPlus className="h-4 w-4" />} onClick={openCreateUser}>Nuevo usuario</Button>
        </div>
      </div>

      <DataTable
        storageKey="novalink.admin.users.table"
        title="Usuarios"
        description={`${usersQuery.data?.length ?? 0} usuario(s) con acceso al panel`}
        data={usersQuery.data ?? []}
        columns={userColumns}
        getRowId={(user) => user.id}
        isLoading={usersQuery.isLoading}
        emptyMessage="No hay usuarios registrados."
        minWidth={760}
      />

      <section className="overflow-hidden rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <div>
            <h2 className="font-semibold">Roles</h2>
            <p className="text-xs text-slate-500">{rolesQuery.data?.length ?? 0} rol(es) · cada rol agrupa permisos por modulo</p>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {(rolesQuery.data ?? []).map((role) => (
            <article key={role.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <strong className="block truncate">{role.name}</strong>
                  <p className="text-xs text-slate-500">{role.description || "Sin descripcion"}</p>
                </div>
                <IconAction label="Editar rol" icon={<Pencil />} tone="edit" variant="outline" size="sm" onClick={() => openEditRole(role)} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <KeyRound className="h-4 w-4 text-slate-400" /> {role.permissions.length} permiso(s)
              </p>
            </article>
          ))}
          {!rolesQuery.isLoading && (rolesQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No hay roles registrados.</p>
          ) : null}
        </div>
      </section>

      {/* Modal usuario (crear/editar) */}
      <AppModal
        open={userModal !== null}
        size="sm"
        title={userModal?.mode === "edit" ? "Editar usuario" : "Nuevo usuario"}
        description={userModal?.mode === "edit" ? userModal.user.username : "Acceso al panel administrativo"}
        onClose={() => setUserModal(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={userMutation.isPending} onClick={() => setUserModal(null)}>Volver</Button>
            <Button
              type="button"
              disabled={userMutation.isPending || (userModal?.mode === "create" && (!userForm.username.trim() || userForm.password.length < 8))}
              onClick={() => userMutation.mutate()}
            >
              {userMutation.isPending ? "Guardando..." : userModal?.mode === "edit" ? "Actualizar usuario" : "Crear usuario"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {userModal?.mode === "create" ? (
            <TextField label="Usuario" value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} />
          ) : null}
          <TextField
            label={userModal?.mode === "edit" ? "Nueva contrasena (opcional)" : "Contrasena"}
            type="password"
            hint="Minimo 8 caracteres"
            value={userForm.password}
            onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
          />
          <fieldset className="rounded-md border px-3 pb-3 pt-1">
            <legend className="px-1 text-xs font-medium text-slate-600">Roles</legend>
            <div className="flex flex-wrap gap-2">
              {roleNames.map((role) => (
                <button
                  key={role}
                  type="button"
                  aria-pressed={userForm.roles.includes(role)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    userForm.roles.includes(role) ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-background text-slate-600 hover:bg-muted"
                  ].join(" ")}
                  onClick={() => setUserForm((current) => ({ ...current, roles: toggleInList(current.roles, role) }))}
                >
                  {role}
                </button>
              ))}
              {roleNames.length === 0 ? <p className="text-xs text-slate-500">Aun no hay roles: crea uno primero.</p> : null}
            </div>
          </fieldset>
        </div>
      </AppModal>

      {/* Confirmar activar/desactivar usuario */}
      <AppModal
        open={toggleUser !== null}
        size="sm"
        title={toggleUser?.isActive ? "Desactivar usuario" : "Activar usuario"}
        description={toggleUser?.username}
        onClose={() => setToggleUser(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={toggleUserMutation.isPending} onClick={() => setToggleUser(null)}>Volver</Button>
            <Button
              type="button"
              variant={toggleUser?.isActive ? "danger" : "primary"}
              disabled={toggleUserMutation.isPending}
              onClick={() => toggleUser && toggleUserMutation.mutate(toggleUser)}
            >
              {toggleUserMutation.isPending ? "Aplicando..." : toggleUser?.isActive ? "Desactivar" : "Activar"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          {toggleUser?.isActive
            ? "El usuario no podra iniciar sesion hasta que se reactive. Sus registros historicos se conservan."
            : "El usuario podra volver a iniciar sesion en el panel."}
        </p>
      </AppModal>

      {/* Modal rol (crear/editar) con permisos agrupados */}
      <AppModal
        open={roleModal !== null}
        size="md"
        title={roleModal?.mode === "edit" ? "Editar rol" : "Nuevo rol"}
        description={roleModal?.mode === "edit" ? roleModal.role.name : "Agrupa permisos para asignarlos a usuarios"}
        onClose={() => setRoleModal(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={roleMutation.isPending} onClick={() => setRoleModal(null)}>Volver</Button>
            <Button type="button" disabled={roleMutation.isPending || !roleForm.name.trim()} onClick={() => roleMutation.mutate()}>
              {roleMutation.isPending ? "Guardando..." : roleModal?.mode === "edit" ? "Actualizar rol" : "Crear rol"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <TextField label="Nombre" hint="Se guarda en mayusculas, ej. COBRADOR" value={roleForm.name} onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))} />
          <TextareaField label="Descripcion" className="min-h-16" value={roleForm.description} onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))} />
          <fieldset className="rounded-md border px-3 pb-3 pt-1">
            <legend className="px-1 text-xs font-medium text-slate-600">Permisos ({roleForm.permissions.length} seleccionados)</legend>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {groupPermissions(permissionCodes).map(([prefix, codes]) => (
                <div key={prefix}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{prefix}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {codes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        aria-pressed={roleForm.permissions.includes(code)}
                        className={[
                          "rounded-full border px-2.5 py-0.5 text-xs transition",
                          roleForm.permissions.includes(code) ? "border-primary bg-primary/10 font-medium text-primary" : "border-slate-200 bg-background text-slate-600 hover:bg-muted"
                        ].join(" ")}
                        onClick={() => setRoleForm((current) => ({ ...current, permissions: toggleInList(current.permissions, code) }))}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {permissionCodes.length === 0 ? <p className="text-xs text-slate-500">Cargando permisos...</p> : null}
            </div>
          </fieldset>
        </div>
      </AppModal>
    </section>
  );
}
