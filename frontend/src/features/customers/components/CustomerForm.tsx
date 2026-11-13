// frontend/src/features/customers/components/CustomerForm.tsx

import { FormEvent, useState } from "react";
import type { CreateCustomerPayload, Customer } from "../api";
import { createCustomer, updateCustomer } from "../api";

interface Props {
  initial?: Customer | null;
  onSuccess?: (c: Customer) => void;
  onCancel?: () => void;
}

export function CustomerForm({ initial, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<CreateCustomerPayload>({
    customerType: initial?.customerType || "INDIVIDUAL",
    name: initial?.name || "",
    tinNo: initial?.tinNo || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    address: initial?.address || "",
    creditLimit: initial?.creditLimit ?? 0,
    creditPeriodDays: initial?.creditPeriodDays ?? 30,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = initial
        ? await updateCustomer(initial.id, form)
        : await createCustomer(form);
      onSuccess?.(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Type
        </label>
        <select
          value={form.customerType}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              customerType: e.target.value as "INDIVIDUAL" | "COMPANY",
            }))
          }
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        >
          <option value="INDIVIDUAL">Individual</option>
          <option value="COMPANY">Company</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Name *
        </label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            TIN
          </label>
          <input
            value={form.tinNo || ""}
            onChange={(e) => setForm((f) => ({ ...f, tinNo: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone
          </label>
          <input
            value={form.phone || ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={form.email || ""}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address
        </label>
        <input
          value={form.address || ""}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Credit limit
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.creditLimit ?? 0}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                creditLimit: Number(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Credit period (days)
          </label>
          <input
            type="number"
            min={1}
            value={form.creditPeriodDays ?? 30}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                creditPeriodDays: Number(e.target.value) || 30,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
          {saving ? "Saving…" : initial ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}