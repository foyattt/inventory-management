// frontend/src/features/credit/api.ts

import { api } from "../../api/client";

export interface CreditLedgerRow {
  id: string;
  customerId: string;
  debitAmount: string | number;
  creditAmount: string | number;
  outstanding: string;
  availableCredit?: string;
  dueDate?: string | null;
  status: string;
  customer: {
    id: string;
    name: string;
    creditLimit: string | number;
    tinNo?: string | null;
  };
  saleTransaction?: {
    id: string;
    gatePassNo: string;
    fsNo: string;
    transactionDate?: string;
  } | null;
}

export interface RecordPaymentPayload {
  customerId: string;
  creditLedgerId?: string;
  amount: number;
  paymentDate?: string;
  reference?: string;
  accountName?: string;
  bankName?: string;
  notes?: string;
}

export async function getCreditOverview(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  overdue?: boolean | string;
} = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.search) q.set("search", params.search);
  if (params.overdue !== undefined) q.set("overdue", String(params.overdue));

  return api<{
    success: boolean;
    data: CreditLedgerRow[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/credit?${q.toString()}`);
}

export async function recordPayment(payload: RecordPaymentPayload) {
  return api<{ success: boolean; message: string; data: unknown }>(
    "/credit/payments",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getPayments(params: {
  customerId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.customerId) q.set("customerId", params.customerId);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));

  return api<{
    success: boolean;
    data: unknown[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/credit/payments?${q.toString()}`);
}

export async function getCustomerCreditSummary(customerId: string) {
  return api<{ success: boolean; data: Record<string, unknown> }>(
    `/credit/summary/${customerId}`
  );
}