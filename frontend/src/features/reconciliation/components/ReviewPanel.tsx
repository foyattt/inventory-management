// frontend/src/features/reconciliation/components/ReviewPanel.tsx

import { FormEvent, useState } from "react";
import { reviewTransaction } from "../api";

interface Props {
  saleTransactionId: string;
  onDone?: () => void;
}

const REVIEW_STATUSES = [
  "MATCHED",
  "QUANTITY_MISMATCH",
  "PRICE_MISMATCH",
  "TAX_OR_TOTAL_MISMATCH",
  "MISSING_FROM_GATE_PASS",
  "MISSING_FROM_INVOICE",
  "NEEDS_REVIEW",
  "REVIEWED",
] as const;

export function ReviewPanel({ saleTransactionId, onDone }: Props) {
  const [status, setStatus] = useState<string>("REVIEWED");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await reviewTransaction(saleTransactionId, { status, notes });
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="font-medium text-slate-900">Review decision</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        >
          {REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Submit review"}
      </button>
    </form>
  );
}