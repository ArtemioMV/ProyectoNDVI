import { httpClient } from "@/services/api/http-client";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PlanType = "INTERNET" | "TV";

export type ServicePlan = {
  id: string;
  type: PlanType;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  downloadMbps?: number | null;
  uploadMbps?: number | null;
  maxScreens?: number | null;
  isActive: boolean;
};

export type CreateServicePlanPayload = {
  type: PlanType;
  name: string;
  description?: string;
  monthlyPrice: number;
  downloadMbps?: number;
  uploadMbps?: number;
  maxScreens?: number;
};

export type UpdateServicePlanPayload = Partial<CreateServicePlanPayload> & {
  isActive?: boolean;
};

export async function fetchServicePlans(type?: PlanType) {
  const response = await httpClient.get<ApiResponse<ServicePlan[]>>("/planes", {
    params: type ? { type } : undefined
  });
  return response.data.data;
}

export async function createServicePlan(payload: CreateServicePlanPayload) {
  const response = await httpClient.post<ApiResponse<ServicePlan>>("/planes", payload);
  return response.data.data;
}

export async function updateServicePlan(id: string, payload: UpdateServicePlanPayload) {
  const response = await httpClient.patch<ApiResponse<ServicePlan>>(`/planes/${id}`, payload);
  return response.data.data;
}
