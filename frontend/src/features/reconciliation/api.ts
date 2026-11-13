// frontend/src/features/reconciliation/api.ts

import { api } from "../../api/client";

export interface ReconciliationReview {
  id: string;
  saleTransactionId: string;
  status: string;
  notes?: string | null;
  createdAt?: string;
  saleTransaction?: {
    id: string;
    gatePassNo: string;
    fsNo: string;
    customer?: { name: string };
  };
}

export interface ComparisonResult {
  saleTransactionId: string;
  status: string;
  differences: {
    quantityMismatches: Array<Record<string, unknown>>;
    priceMismatches: Array<Record<string, unknown>>;
    missingInInvoice: Array<Record<string, unknown>>;
    missingInGatePass: Array<Record<string, unknown>>;
    taxOrTotalMismatch?: Record<string, unknown> | null;
  };
  gatePassTotals?: Record<string, unknown>;
  invoiceTotals?: Record<string, unknown>;
}

export async function getReviews(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);

  return api<{
    success: boolean;
    data: ReconciliationReview[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/reconciliation?${q.toString()}`);
}

export async function compareTransaction(id: string) {
  return api<{ success: boolean; data: ComparisonResult }>(
    `/reconciliation/compare/${id}`
  );
}

export async function reviewTransaction(
  id: string,
  payload: { status: string; notes?: string }
) {
  return api<{ success: boolean; message: string; data: unknown }>(
    `/reconciliation/review/${id}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}