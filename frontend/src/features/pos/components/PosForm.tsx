// frontend/src/features/pos/components/PosForm.tsx

import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { ApiError, api } from "../../../api/client";
import { createCustomer } from "../../customers/api";
import {
  createTransaction,
  searchCustomers,
  getNextNumbers,
} from "../api";
import { usePosForm } from "../hooks/usePosForm";
import { useStockCheck } from "../hooks/useStockCheck";
import { useDepositValidation } from "../hooks/useDepositValidation";
import { GatePassItemsTable } from "./GatePassItemsTable";
import { InvoiceItemsTable } from "./InvoiceItemsTable";
import { TotalsPanel } from "./TotalsPanel";
import { DepositAllocations } from "./DepositAllocations";
import { TransactionHeader } from "./TransactionHeader";
import type { CustomerOption, PosProduct } from "../types";

export function PosForm() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [numbersLoaded, setNumbersLoaded] = useState(false);

  const {
    form,
    setField,
    setProducts,
    updateQuantity,
    addDeposit,
    updateDeposit,
    removeDeposit,
    clear,
    totals,
    toPayload,
  } = usePosForm();

  const stockCheck = useStockCheck(form.gatePassItems);
  const depositCheck = useDepositValidation(
    form.depositAllocations,
    totals.gateTotal
  );

  // Auto-load next Gate Pass / FS numbers on mount and after successful save
  const loadNextNumbers = async () => {
    try {
      const res = await getNextNumbers();
      if (res.data) {
        setField("gatePassNo", res.data.gatePassNo);
        setField("fsNo", res.data.fsNo);
        setNumbersLoaded(true);
      }
    } catch (err) {
      // Non-fatal: user can still type manually
      console.warn("Could not load next numbers", err);
    }
  };

  useEffect(() => {
    void loadNextNumbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });
        if (debouncedSearch) params.set("search", debouncedSearch);

        const result = await api<{
          data: Array<{
            id: string;
            internalCode: string;
            name: string;
            primaryUnitCost: string | number | null;
            stockSummary: { total: number };
          }>;
        }>(`/inventory/products?${params.toString()}`);

        const mapped: PosProduct[] = result.data.map((p) => ({
          id: p.id,
          code: p.internalCode,
          name: p.name,
          available: p.stockSummary.total,
          price: Number(p.primaryUnitCost || 0),
          quantity: 0,
        }));
        setProducts(mapped);
        setError("");
      } catch (err) {
        setProducts([]);
        setError(
          err instanceof ApiError && err.status === 401
            ? "Sign in to load POS listings."
            : err instanceof Error
            ? err.message
            : "Failed to load inventory"
        );
      }
    };
    void load();
  }, [debouncedSearch, page, setProducts]);

  useEffect(() => {
    if (!customerSearch.trim() || form.customer) {
      setCustomerOptions([]);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const res = await searchCustomers(customerSearch, 8);
        setCustomerOptions(res.data || []);
      } catch {
        setCustomerOptions([]);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [customerSearch, form.customer]);

  /**
   * Auto-register a new customer when the typed name is not found.
   * TIN can be added/edited later from the Customers page.
   */
  const ensureCustomer = async (): Promise<CustomerOption | null> => {
    if (form.customer) return form.customer;
    const name = customerSearch.trim();
    if (!name) return null;

    // Prefer an existing match (case-insensitive)
    const existing = customerOptions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      setField("customer", existing);
      return existing;
    }

    try {
      const created = await createCustomer({
        customerType: "INDIVIDUAL",
        name,
      });
      const option: CustomerOption = {
        id: created.data.id,
        name: created.data.name,
        tinNo: created.data.tinNo,
        phone: created.data.phone,
        creditLimit: created.data.creditLimit,
        creditPeriodDays: created.data.creditPeriodDays,
      };
      setField("customer", option);
      setCustomerSearch(option.name);
      setCustomerOptions([]);
      return option;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not register new customer"
      );
      return null;
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Auto-register customer if only a name was typed
    const customer = await ensureCustomer();
    if (!customer) {
      setError("Customer is required. Type a name to auto-register or select an existing one.");
      return;
    }

    const payload = toPayload();
    if (!payload) {
      setError(
        "Gate Pass No, FS No, payment method and at least one Gate Pass item are required."
      );
      return;
    }

    // Ensure customerId is current (in case we just registered)
    payload.customerId = customer.id;

    if (!stockCheck.isValid) {
      setError(`Insufficient stock: ${stockCheck.messages.join("; ")}`);
      return;
    }
    if (payload.paymentMethod === "CASH" && !depositCheck.isValid) {
      setError(
        `Deposit allocations must equal Gate Pass total (${totals.gateTotal}). Add one or more bank rows so the sum matches.`
      );
      return;
    }

    setSaving(true);
    try {
      await createTransaction(payload);
      setSuccess(
        `Transaction saved. Gate Pass ${payload.gatePassNo} / FS ${payload.fsNo}`
      );
      clear();
      setCustomerSearch("");
      setCustomerOptions([]);
      // Load next numbers for the following transaction
      await loadNextNumbers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save transaction"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterCustomer = async () => {
    const name = customerSearch.trim();
    if (!name) {
      setError("Type a customer name first.");
      return;
    }
    setError("");
    await ensureCustomer();
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT – main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              New transaction
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Record stock movement and invoice values independently under one
              transaction. Multiple bank deposits are supported for Cash.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search inventory by product, part number, or SKU..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="mb-6">
            <GatePassItemsTable
              items={form.gatePassItems}
              onQuantityChange={(id, delta) =>
                updateQuantity("gate", id, delta)
              }
            />
            <TotalsPanel
              subtotal={totals.gateSubtotal}
              taxAmount={totals.gateTax}
              total={totals.gateTotal}
              taxRatePercent={totals.taxRatePercent}
              label="Total Gate Pass Sales Value"
            />
          </div>

          <div className="mb-6">
            <InvoiceItemsTable
              items={form.invoiceItems}
              onQuantityChange={(id, delta) =>
                updateQuantity("invoice", id, delta)
              }
            />
            <TotalsPanel
              subtotal={totals.invoiceSubtotal}
              taxAmount={totals.invoiceTax}
              total={totals.invoiceTotal}
              taxRatePercent={totals.taxRatePercent}
              label="Total Invoice Sales Value"
            />
          </div>

          {/* Deposit Allocations removed from left column */}

          <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs">
                ✓
              </span>
              Only Gate Pass Items deduct stock · Deposit total must match Gate
              Pass total
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {saving ? "Saving…" : "Save transaction"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </main>
      </div>

      {/* RIGHT – Transaction summary + Deposit Allocations below */}
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <TransactionHeader
            gatePassNo={form.gatePassNo}
            fsNo={form.fsNo}
            customer={form.customer}
            paymentMethod={form.paymentMethod}
            customerSearch={customerSearch}
            customerOptions={customerOptions}
            onGatePassNoChange={(v) => setField("gatePassNo", v)}
            onFsNoChange={(v) => setField("fsNo", v)}
            onCustomerSearchChange={(v) => {
              setCustomerSearch(v);
              setField("customer", null);
            }}
            onSelectCustomer={(c) => {
              setField("customer", c);
              setCustomerSearch(c.name);
              setCustomerOptions([]);
            }}
            onPaymentMethodChange={(v) => {
              setField("paymentMethod", v);
              if (v === "CASH" && form.depositAllocations.length === 0) {
                addDeposit();
              }
            }}
            onClear={() => {
              clear();
              setCustomerSearch("");
              setCustomerOptions([]);
              setSuccess("");
              setError("");
            }}
            onRegisterCustomer={ensureCustomer}
          />

          {/* Cash Deposit Allocations – directly below transaction fields */}
          {form.paymentMethod === "CASH" && (
            <div className="border-t border-slate-100 p-5">
              <DepositAllocations
                allocations={form.depositAllocations}
                expectedTotal={totals.gateTotal}
                onAdd={addDeposit}
                onUpdate={updateDeposit}
                onRemove={removeDeposit}
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}