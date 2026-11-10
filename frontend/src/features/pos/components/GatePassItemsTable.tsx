// frontend/src/features/pos/components/GatePassItemsTable.tsx

import { Minus, Package, Plus, Trash2 } from "lucide-react";
import type { PosProduct } from "../types";

interface Props {
  items: PosProduct[];
  onQuantityChange: (id: string, delta: number) => void;
  onRemove?: (id: string) => void;
}

export function GatePassItemsTable({
  items,
  onQuantityChange,
  onRemove,
}: Props) {
  const selectedCount = items.filter((i) => i.quantity > 0).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
        <div>
          <h2 className="font-medium text-slate-900">
            Gate Pass Items — Stock Deducted
          </h2>
          <p className="text-xs text-slate-500">
            Actual sales recorded here reduce inventory after a successful
            save.
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
          {selectedCount} selected
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">INVENTORY ID</th>
              <th className="text-left px-5 py-3 font-medium">PRODUCT</th>
              <th className="text-left px-5 py-3 font-medium">AVAILABLE</th>
              <th className="text-left px-5 py-3 font-medium">QUANTITY</th>
              <th className="text-left px-5 py-3 font-medium">
                UNIT SELLING PRICE
              </th>
              <th className="text-left px-5 py-3 font-medium">LINE SUBTOTAL</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">
                  {item.code || item.id}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        Inventory movement
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium ${
                      item.available === 0
                        ? "text-red-600"
                        : item.available < 30
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {item.available} units
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, -1)}
                      className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.id, 1)}
                      className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3">${item.price.toFixed(2)}</td>
                <td className="px-5 py-3 font-medium">
                  {item.quantity > 0
                    ? `$${(item.price * item.quantity).toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}