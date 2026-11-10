// frontend/src/features/credit/components/CreditOverview.tsx

import { formatMoney } from "../../../api/client";
import { formatDate } from "../../../lib/utils";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import type { CreditLedgerRow } from "../api";

interface Props {
  rows: CreditLedgerRow[];
  onSelect?: (row: CreditLedgerRow) => void;
}

export function CreditOverview({ rows, onSelect }: Props) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        No credit ledgers found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Customer</th>
            <th className="text-left px-5 py-3 font-medium">Gate Pass</th>
            <th className="text-left px-5 py-3 font-medium">Outstanding</th>
            <th className="text-left px-5 py-3 font-medium">Due date</th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-slate-50 cursor-pointer"
              onClick={() => onSelect?.(row)}
            >
              <td className="px-5 py-3 font-medium text-slate-900">
                {row.customer.name}
              </td>
              <td className="px-5 py-3">
                {row.saleTransaction?.gatePassNo || "—"}
              </td>
              <td className="px-5 py-3">{formatMoney(row.outstanding)}</td>
              <td className="px-5 py-3">{formatDate(row.dueDate)}</td>
              <td className="px-5 py-3">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}