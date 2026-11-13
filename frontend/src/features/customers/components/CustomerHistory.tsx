// frontend/src/features/customers/components/CustomerHistory.tsx

import { useEffect, useState } from "react";
import { formatMoney } from "../../../api/client";
import { formatDate } from "../../../lib/utils";
import { getTransactions } from "../../pos/api";
import type { TransactionSummary } from "../../pos/types";

interface Props {
  customerId: string;
}

export function CustomerHistory({ customerId }: Props) {
  const [rows, setRows] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getTransactions({
          customerId,
          limit: 20,
        });
        setRows(res.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [customerId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading history…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">No transactions for this customer.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="text-left px-4 py-2">Gate Pass</th>
            <th className="text-left px-4 py-2">FS No</th>
            <th className="text-left px-4 py-2">Payment</th>
            <th className="text-left px-4 py-2">Total</th>
            <th className="text-left px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2">{r.gatePassNo}</td>
              <td className="px-4 py-2">{r.fsNo}</td>
              <td className="px-4 py-2">{r.paymentMethod}</td>
              <td className="px-4 py-2">{formatMoney(r.gatePassTotal)}</td>
              <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}