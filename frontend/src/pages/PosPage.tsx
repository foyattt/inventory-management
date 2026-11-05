import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RefreshCw,
  CreditCard,
  Users,
  Bell,
  Calendar,
  Search,
  HelpCircle,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { ApiError, api, formatMoney } from "../api/client";
import { moneyAdd, moneyMul, moneyTax } from "../utils/money";

interface Product {
  id: string;
  name: string;
  available: number;
  price: number;
  quantity: number;
}

interface TransactionRow {
  id: string;
  gatePassNo: string;
  fsNo: string;
  customer: string;
  paymentMethod: string;
  total: string;
}

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [txPayment, setTxPayment] = useState("");
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [txPagination, setTxPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [error, setError] = useState("");
  const [gatePassItems, setGatePassItems] = useState<Product[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<Product[]>([]);
  const [productPagination, setProductPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  const updateQuantity = (
    list: "gate" | "invoice",
    id: string,
    delta: number
  ) => {
    const setter = list === "gate" ? setGatePassItems : setInvoiceItems;
    setter((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const calcSubtotal = (items: Product[]) =>
    items.reduce((sum, item) => moneyAdd(sum, moneyMul(item.quantity, item.price)), "0.00");

  const gateSubtotal = calcSubtotal(gatePassItems);
  const invoiceSubtotal = calcSubtotal(invoiceItems);
  const gateTax = moneyTax(gateSubtotal);
  const invoiceTax = moneyTax(invoiceSubtotal);
  const gateTotal = moneyAdd(gateSubtotal, gateTax);
  const invoiceTotal = moneyAdd(invoiceSubtotal, invoiceTax);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const productQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    return params.toString();
  }, [page, debouncedSearch]);

  const txQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(txPage), limit: "10" });
    if (txSearch) params.set("search", txSearch);
    if (txPayment) params.set("paymentMethod", txPayment);
    return params.toString();
  }, [txPage, txSearch, txPayment]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api<{
          data: Array<{
            id: string;
            internalCode: string;
            name: string;
            primaryUnitCost: string | number | null;
            stockSummary: { total: number };
          }>;
          pagination: { total: number; page: number; limit: number; totalPages: number };
        }>(`/inventory/products?${productQuery}`);
        const mapped = result.data.map((product) => ({
          id: product.id,
          name: product.name,
          available: product.stockSummary.total,
          price: Number(product.primaryUnitCost || 0),
          quantity: 0,
          code: product.internalCode,
        }));
        setGatePassItems(mapped);
        setInvoiceItems(mapped.map((item) => ({ ...item })));
        setProductPagination(result.pagination);
        setError("");
      } catch (err) {
        setGatePassItems([]);
        setInvoiceItems([]);
        setError(err instanceof ApiError && err.status === 401 ? "Sign in to load POS listings." : err instanceof Error ? err.message : "Failed to load POS inventory");
      }
    };
    void load();
  }, [productQuery]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api<{
          data: Array<{
            id: string;
            gatePassNo: string;
            fsNo: string;
            paymentMethod: string;
            gatePassTotal: string;
            customer: { name: string };
          }>;
          pagination: { total: number; page: number; limit: number; totalPages: number };
        }>(`/pos/transactions?${txQuery}`);
        setTransactions(
          result.data.map((row) => ({
            id: row.id,
            gatePassNo: row.gatePassNo,
            fsNo: row.fsNo,
            customer: row.customer.name,
            paymentMethod: row.paymentMethod,
            total: formatMoney(row.gatePassTotal),
          }))
        );
        setTxPagination(result.pagination);
      } catch {
        setTransactions([]);
      }
    };
    void load();
  }, [txQuery]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-lg">Stockwise</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Workspace
          </p>
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Reports" />
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" active />
          <NavItem to="/reconciliation" icon={<RefreshCw size={18} />} label="Reconciliation" />
          <NavItem to="/credit" icon={<CreditCard size={18} />} label="Credit" />
          <NavItem to="/customer" icon={<Users size={18} />} label="Customer" />
        </nav>

        <div className="p-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-blue-400" />
              <span className="text-sm font-medium">Need assistance?</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Visit the operations help center.</p>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Open help center <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main + Right panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="text-sm text-slate-500">
              Stockwise <span className="mx-1">/</span>{" "}
              <span className="text-slate-900 font-medium">Point of Sale</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} />
                <span>Saturday, 24 May</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Point of Sale
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">New transaction</h1>
              <p className="text-sm text-slate-500 mt-1">
                Record stock movement and invoice values independently under one transaction.
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory by product, part number, or SKU..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Gate Pass Items */}
            <div className="bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                <div>
                  <h2 className="font-medium text-slate-900">Gate Pass Items — Stock Deducted</h2>
                  <p className="text-xs text-slate-500">Actual sales recorded here reduce inventory after a successful save.</p>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  0 selected
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
                      <th className="text-left px-5 py-3 font-medium">UNIT SELLING PRICE</th>
                      <th className="text-left px-5 py-3 font-medium">LINE SUBTOTAL</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gatePassItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">{item.id}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package size={14} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-400">Inventory movement</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium ${item.available === 0 ? "text-red-600" : item.available < 30 ? "text-amber-600" : "text-emerald-600"}`}>
                            {item.available} units
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity("gate", item.id, -1)}
                              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity("gate", item.id, 1)}
                              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3">${item.price.toFixed(2)}</td>
                        <td className="px-5 py-3 font-medium">
                          {item.quantity > 0 ? `$${(item.price * item.quantity).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <button className="p-1.5 text-slate-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-5 py-3 border-t border-slate-100 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Subtotal before tax</p>
                  <p className="font-medium">${gateSubtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Tax rate</p>
                  <p className="font-medium">15%</p>
                </div>
                <div>
                  <p className="text-slate-500">Tax amount</p>
                  <p className="font-medium">${(gateSubtotal * taxRate).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Total Gate Pass Sales Value</p>
                  <p className="font-semibold text-blue-600">${(gateSubtotal * (1 + taxRate)).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-violet-50/50">
                <div>
                  <h2 className="font-medium text-slate-900">Invoice Items — No Stock Deduction</h2>
                  <p className="text-xs text-slate-500">Invoice recording only. These quantities never create stock movements.</p>
                </div>
                <span className="text-xs font-medium text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full">
                  0 selected
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
                      <th className="text-left px-5 py-3 font-medium">UNIT SELLING PRICE</th>
                      <th className="text-left px-5 py-3 font-medium">LINE SUBTOTAL</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">{item.id}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                              <Package size={14} className="text-violet-500" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-400">Invoice record only</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium ${item.available === 0 ? "text-red-600" : item.available < 30 ? "text-amber-600" : "text-emerald-600"}`}>
                            {item.available} units
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity("invoice", item.id, -1)}
                              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity("invoice", item.id, 1)}
                              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3">${item.price.toFixed(2)}</td>
                        <td className="px-5 py-3 font-medium">
                          {item.quantity > 0 ? `$${(item.price * item.quantity).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <button className="p-1.5 text-slate-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Subtotal before tax</p>
                  <p className="font-medium">${invoiceSubtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Tax rate</p>
                  <p className="font-medium">15%</p>
                </div>
                <div>
                  <p className="text-slate-500">Tax amount</p>
                  <p className="font-medium">${(invoiceSubtotal * taxRate).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Total Invoice Sales Value</p>
                  <p className="font-semibold text-blue-600">${(invoiceSubtotal * (1 + taxRate)).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs">✓</span>
                Only Gate Pass Items deduct stock
              </div>
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                Save transaction <ArrowRight size={16} />
              </button>
            </div>
          </main>
        </div>

        {/* Right panel - Transaction Information */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Manual entry</h2>
            <button className="text-sm text-red-500 hover:text-red-600">Clear</button>
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
                placeholder="Search registered customers"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Plus size={14} /> Register a new customer
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="payment" className="text-blue-600" />
                  <span className="text-sm">Cash</span>
                </label>
                <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="payment" className="text-blue-600" />
                  <span className="text-sm">Credit</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Transaction summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gate Pass</span>
                  <span className="text-slate-400">Not entered</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FS No.</span>
                  <span className="text-slate-400">Not entered</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="text-slate-400">Not selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment</span>
                  <span className="text-slate-400">Not selected</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ to, icon, label, active = false }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
