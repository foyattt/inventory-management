// frontend/src/features/credit/components/PaymentForm.tsx

import { FormEvent, useState } from "react";
import { recordPayment, type RecordPaymentPayload } from "../api";
import {
  ACCOUNT_NAMES,
  BANK_NAMES,
  type AccountName,
  type BankName,
} from "../../pos/types";

interface Props {
  customerId: string;
  creditLedgerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({
  customerId,
  creditLedgerId,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState<RecordPaymentPayload>({
    customerId,
    creditLedgerId,
    amount: 0,
    accountName: "Zesino",
    bankName: "CBE",
    reference: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.amount || form.amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    setSaving(true);
    try {
      await recordPayment(form);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Amount *
        </label>
        <input
          type="number"
          min={0.01}
          step="0.01"
          required
          value={form.amount || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))
          }
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Account
          </label>
          <select
            value={form.accountName || "Zesino"}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                accountName: e.target.value as AccountName,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          >
            {ACCOUNT_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bank
          </label>
          <select
            value={form.bankName || "CBE"}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                bankName: e.target.value as BankName,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          >
            {BANK_NAMES.map((n) => (
              <option key={n} value={n}>
                {n.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reference
        </label>
        <input
          value={form.reference || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, reference: e.target.value }))
          }
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          value={form.notes || ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Recording…" : "Record payment"}
        </button>
      </div>
    </form>
  );
}