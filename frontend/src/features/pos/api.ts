// frontend/src/features/pos/api.ts

import { api } from "../../api/client";
import type {
  CreateTransactionPayload,
  PaginatedResponse,
  TransactionSummary,
  CustomerOption,
} from "./types";

export async function createTransaction(payload: CreateTransactionPayload) {
  return api<{
    success: boolean;
    message: string;
    data: TransactionSummary & Record<string, unknown>;
  }>("/pos/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTransactions(params: {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.paymentMethod) query.set("paymentMethod", params.paymentMethod);
  if (params.customerId) query.set("customerId", params.customerId);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  return api<{
    success: boolean;
  } & PaginatedResponse<TransactionSummary>>(`/pos/transactions?${query.toString()}`);
}

export async function getTransactionById(id: string) {
  return api<{
    success: boolean;
    data: TransactionSummary & Record<string, unknown>;
  }>(`/pos/transactions/${id}`);
}

export async function searchCustomers(search: string, limit = 10) {
  const query = new URLSearchParams({
    search,
    limit: String(limit),
    page: "1",
  });
  return api<{
    success?: boolean;
    data: CustomerOption[];
    pagination?: PaginatedResponse<CustomerOption>["pagination"];
  }>(`/customers?${query.toString()}`);
}