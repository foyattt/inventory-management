// frontend/src/components/shared/StatusBadge.tsx

import { cn } from "../../lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // stock
  "In Stock": "bg-emerald-100 text-emerald-700",
  "Reorder Required": "bg-amber-100 text-amber-800",
  "Out of Stock": "bg-red-100 text-red-700",
  // credit
  WITHIN_LIMIT: "bg-emerald-100 text-emerald-700",
  NEAR_LIMIT: "bg-amber-100 text-amber-800",
  OVER_LIMIT: "bg-red-100 text-red-700",
  DUE_SOON: "bg-amber-100 text-amber-800",
  OVERDUE: "bg-red-100 text-red-700",
  SETTLED: "bg-slate-100 text-slate-600",
  // reconciliation
  MATCHED: "bg-emerald-100 text-emerald-700",
  QUANTITY_MISMATCH: "bg-amber-100 text-amber-800",
  PRICE_MISMATCH: "bg-amber-100 text-amber-800",
  TAX_OR_TOTAL_MISMATCH: "bg-amber-100 text-amber-800",
  MISSING_FROM_GATE_PASS: "bg-red-100 text-red-700",
  MISSING_FROM_INVOICE: "bg-red-100 text-red-700",
  NEEDS_REVIEW: "bg-blue-100 text-blue-700",
  REVIEWED: "bg-slate-100 text-slate-600",
  // payment
  CASH: "bg-emerald-100 text-emerald-700",
  CREDIT: "bg-violet-100 text-violet-700",
};

interface Props {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}