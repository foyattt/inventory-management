// frontend/src/features/pos/components/DepositAllocations.tsx

import { Plus, Trash2 } from "lucide-react";
import {
  ACCOUNT_NAMES,
  BANK_NAMES,
  type AccountName,
  type BankName,
  type DepositAllocationInput,
} from "../types";
import { useDepositValidation } from "../hooks/useDepositValidation";
import { formatMoney } from "../../../api/client";

interface Props {
  allocations: DepositAllocationInput[];
  expectedTotal: string;
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<DepositAllocationInput>) => void;
  onRemove: (index: number) => void;
}

export function DepositAllocations({
  allocations,
  expectedTotal,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const validation = useDepositValidation(allocations, expectedTotal);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">
          Deposit allocations (Cash)
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {allocations.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-2 items-end border border-slate-200 rounded-lg p-3"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">Account</label>
            <select
              value={row.accountName}
              onChange={(e) =>
                onUpdate(index, {
                  accountName: e.target.value as AccountName,
                })
              }
              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5"
            >
              {ACCOUNT_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Bank</label>
            <select
              value={row.bankName}
              onChange={(e) =>
                onUpdate(index, { bankName: e.target.value as BankName })
              }
              className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5"
            >
              {BANK_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Amount</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={row.amount || ""}
                onChange={(e) =>
                  onUpdate(index, {
                    amount: Number(e.target.value) || 0,
                  })
                }
                className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 text-slate-400 hover:text-red-600 self-end"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      <div className="text-xs text-slate-600 flex justify-between">
        <span>
          Allocated: {formatMoney(validation.totalAllocated)} / Expected:{" "}
          {formatMoney(validation.expected)}
        </span>
        {!validation.isValid && validation.hasAllocations && (
          <span className="text-red-600">
            Difference: {validation.difference}
          </span>
        )}
      </div>
    </div>
  );
}