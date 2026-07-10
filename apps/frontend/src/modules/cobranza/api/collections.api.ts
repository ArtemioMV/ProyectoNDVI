import { httpClient } from "@/services/api/http-client";
import type { CollectionsResponse, CollectionStatusFilter } from "../types/collections.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function fetchCollections(params: { search?: string; status?: CollectionStatusFilter; dateFrom?: string; dateTo?: string }) {
  const response = await httpClient.get<ApiResponse<CollectionsResponse>>("/cobranza", {
    params: {
      search: params.search || undefined,
      status: params.status && params.status !== "ALL" ? params.status : undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined
    }
  });
  return response.data.data;
}


