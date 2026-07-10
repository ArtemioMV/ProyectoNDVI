import { httpClient } from "@/services/api/http-client";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export type AdminUser = {
  id: string;
  username: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminRole = {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
};

export type AdminPermission = {
  id: string;
  code: string;
  description?: string | null;
};

export type SaveUserPayload = {
  username?: string;
  password?: string;
  isActive?: boolean;
  roles?: string[];
};

export type SaveRolePayload = {
  name?: string;
  description?: string;
  permissions?: string[];
};

export async function fetchAdminUsers() {
  const response = await httpClient.get<ApiResponse<AdminUser[]>>("/usuarios");
  return response.data.data;
}

export async function createAdminUser(payload: SaveUserPayload & { username: string; password: string }) {
  const response = await httpClient.post<ApiResponse<AdminUser>>("/usuarios", payload);
  return response.data.data;
}

export async function updateAdminUser(id: string, payload: SaveUserPayload) {
  const response = await httpClient.patch<ApiResponse<AdminUser>>(`/usuarios/${id}`, payload);
  return response.data.data;
}

export async function fetchAdminRoles() {
  const response = await httpClient.get<ApiResponse<AdminRole[]>>("/roles");
  return response.data.data;
}

export async function createAdminRole(payload: SaveRolePayload & { name: string }) {
  const response = await httpClient.post<ApiResponse<AdminRole>>("/roles", payload);
  return response.data.data;
}

export async function updateAdminRole(id: string, payload: SaveRolePayload) {
  const response = await httpClient.patch<ApiResponse<AdminRole>>(`/roles/${id}`, payload);
  return response.data.data;
}

export async function fetchAdminPermissions() {
  const response = await httpClient.get<ApiResponse<AdminPermission[]>>("/permisos");
  return response.data.data;
}
