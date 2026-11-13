// frontend/src/features/pos/components/TransactionHeader.tsx

import { Plus } from "lucide-react";
import type { CustomerOption, PaymentMethod } from "../types";

interface Props {
  gatePassNo: string;
  fsNo: string;
  customer: CustomerOption | null;
  paymentMethod: PaymentMethod | "";
  customerSearch: string;
  customerOptions: CustomerOption[];
  onGatePassNoChange: (v: string) => void;
  onFsNoChange: (v: string) => void;
  onCustomerSearchChange: (v: string) => void;
  onSelectCustomer: (c: CustomerOption) => void;
  onPaymentMethodChange: (v: PaymentMethod) => void;
  onClear: () => void;
  onRegisterCustomer?: () => void;
}

export function TransactionHeader({
  gatePassNo,
  fsNo,
  customer,
  paymentMethod,
  customerSearch,
  customerOptions,
  onGatePassNoChange,
  onFsNoChange,
  onCustomerSearchChange,
  onSelectCustomer,
  onPaymentMethodChange,
  onClear,
  onRegisterCustomer,
}: Props) {
  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Manual entry</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg">
          Required workflow: Identify documents, customer, then payment route.
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Gate Pass No. <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={gatePassNo}
            onChange={(e) => onGatePassNoChange(e.target.value)}
            placeholder="Enter manually"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            FS No. <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fsNo}
            onChange={(e) => onFsNoChange(e.target.value)}
            placeholder="Enter manually"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Customer name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customer ? customer.name : customerSearch}
            onChange={(e) => {
              onCustomerSearchChange(e.target.value);
            }}
            placeholder="Search registered customers"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {customerOptions.length > 0 && !customer && (
            <ul className="mt-1 border border-slate-200 rounded-lg bg-white shadow-sm max-h-40 overflow-auto">
              {customerOptions.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    {c.name}
                    {c.tinNo ? (
                      <span className="text-xs text-slate-400 ml-2">
                        TIN: {c.tinNo}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {onRegisterCustomer && (
            <button
              type="button"
              onClick={onRegisterCustomer}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} /> Register a new customer
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "CASH"}
                onChange={() => onPaymentMethodChange("CASH")}
                className="text-blue-600"
              />
              <span className="text-sm">Cash</span>
            </label>
            <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "CREDIT"}
                onChange={() => onPaymentMethodChange("CREDIT")}
                className="text-blue-600"
              />
              <span className="text-sm">Credit</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-900 mb-3">
            Transaction summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Gate Pass</span>
              <span className={gatePassNo ? "text-slate-900" : "text-slate-400"}>
                {gatePassNo || "Not entered"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">FS No.</span>
              <span className={fsNo ? "text-slate-900" : "text-slate-400"}>
                {fsNo || "Not entered"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer</span>
              <span
                className={customer ? "text-slate-900" : "text-slate-400"}
              >
                {customer?.name || "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment</span>
              <span
                className={paymentMethod ? "text-slate-900" : "text-slate-400"}
              >
                {paymentMethod || "Not selected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}