import { httpClient } from "@/services/api/http-client";
import type { CreateExpenseCategoryPayload, CreateExpensePayload, Expense, ExpenseCategory } from "../types/expenses.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function fetchExpenseCategories() {
  const response = await httpClient.get<ApiResponse<ExpenseCategory[]>>("/gastos/categorias");
  return response.data.data;
}

export async function createExpenseCategory(payload: CreateExpenseCategoryPayload) {
  const response = await httpClient.post<ApiResponse<ExpenseCategory>>("/gastos/categorias", payload);
  return response.data.data;
}

export async function fetchExpenses(period?: string) {
  const response = await httpClient.get<ApiResponse<Expense[]>>("/gastos", { params: period ? { period } : undefined });
  return response.data.data;
}

export async function createExpense(payload: CreateExpensePayload) {
  const response = await httpClient.post<ApiResponse<Expense>>("/gastos", payload);
  return response.data.data;
}

export async function voidExpense(id: string) {
  const response = await httpClient.patch("/gastos/" + id + "/anular");
  return response.data;
}
