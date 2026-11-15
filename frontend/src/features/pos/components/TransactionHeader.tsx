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
    <>
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

      <div className="p-5 space-y-5">
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
                      <span className="text-slate-400 ml-1">· {c.tinNo}</span>
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
              className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Register new customer
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Payment method <span className="text-red-500">*</span>
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              onPaymentMethodChange(e.target.value as PaymentMethod)
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select method</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>
      </div>
    </>
  );
}