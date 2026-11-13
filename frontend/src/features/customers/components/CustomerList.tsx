// frontend/src/features/customers/components/CustomerList.tsx

import { formatMoney } from "../../../api/client";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import type { Customer } from "../api";

interface Props {
  customers: Customer[];
  onSelect?: (c: Customer) => void;
}

export function CustomerList({ customers, onSelect }: Props) {
  if (customers.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        No customers found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="text-left px-5 py-3 font-medium">Name</th>
            <th className="text-left px-5 py-3 font-medium">Type</th>
            <th className="text-left px-5 py-3 font-medium">TIN</th>
            <th className="text-left px-5 py-3 font-medium">Phone</th>
            <th className="text-left px-5 py-3 font-medium">Credit limit</th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-slate-50 cursor-pointer"
              onClick={() => onSelect?.(c)}
            >
              <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
              <td className="px-5 py-3">{c.customerType}</td>
              <td className="px-5 py-3">{c.tinNo || "—"}</td>
              <td className="px-5 py-3">{c.phone || "—"}</td>
              <td className="px-5 py-3">{formatMoney(c.creditLimit)}</td>
              <td className="px-5 py-3">
                <StatusBadge
                  status={c.isActive ? "In Stock" : "Out of Stock"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}