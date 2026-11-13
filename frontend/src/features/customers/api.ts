// frontend/src/features/customers/api.ts

import { api } from "../../api/client";

export interface Customer {
  id: string;
  customerType: "INDIVIDUAL" | "COMPANY";
  name: string;
  tinNo?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  creditLimit: string | number;
  creditPeriodDays: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateCustomerPayload {
  customerType: "INDIVIDUAL" | "COMPANY";
  name: string;
  tinNo?: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit?: number | string;
  creditPeriodDays?: number;
}

export async function getCustomers(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));

  return api<{
    success: boolean;
    data: Customer[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/customers?${q.toString()}`);
}

export async function getCustomerById(id: string) {
  return api<{ success: boolean; data: Customer }>(`/customers/${id}`);
}

export async function createCustomer(payload: CreateCustomerPayload) {
  return api<{ success: boolean; message: string; data: Customer }>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateCustomer(
  id: string,
  payload: Partial<CreateCustomerPayload>
) {
  return api<{ success: boolean; message: string; data: Customer }>(
    `/customers/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}