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
  HelpCircle,
  ArrowRight,
  Search,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { ApiError, api, formatMoney } from "../api/client";

interface CreditRow {
  id: string;
  name: string;
  code: string;
  outstanding: string;
  maxLimit: string;
  available: string;
  transactionDate: string;
  dueDate: string;
  timeStatus: string;
  creditStatus: string;
}

interface CreditResponse {
  success: boolean;
  data: Array<{
    id: string;
    status: string;
    dueDate: string | null;
    outstanding: string;
    availableCredit: string;
    customer: { id: string; name: string; creditLimit: string; tinNo: string | null };
    saleTransaction: { transactionDate: string; gatePassNo: string } | null;
  }>;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

function daysLabel(dueDate: string | null, status: string): string {
  if (status === "SETTLED") return "Settled";
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  const diff = Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `${diff} days overdue`;
  if (diff === 0) return "Due today";
  return `Due in ${Math.abs(diff)} days`;
}

function prettyStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CreditPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<CreditRow[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status === "OVERDUE") params.set("overdue", "true");
    else if (status) params.set("status", status);
    return params.toString();
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api<CreditResponse>(`/credit?${query}`);
        setAccounts(
          result.data.map((ledger) => ({
            id: ledger.id,
            name: ledger.customer.name,
            code: ledger.saleTransaction?.gatePassNo || ledger.customer.tinNo || ledger.customer.id.slice(-6),
            outstanding: formatMoney(ledger.outstanding),
            maxLimit: formatMoney(ledger.customer.creditLimit),
            available: formatMoney(ledger.availableCredit),
            transactionDate: ledger.saleTransaction?.transactionDate
              ? ledger.saleTransaction.transactionDate.slice(0, 10)
              : "—",
            dueDate: ledger.dueDate ? ledger.dueDate.slice(0, 10) : "—",
            timeStatus: daysLabel(ledger.dueDate, ledger.status),
            creditStatus: prettyStatus(ledger.status),
          }))
        );
        setPagination(result.pagination);
      } catch (err) {
        setAccounts([]);
        if (err instanceof ApiError && err.status === 401) {
          setError("Sign in to load credit listings.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load credit");
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [query]);

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">S</div>
          <span className="font-semibold text-lg">ZeSino</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Workspace</p>
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Reports" />
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" />
          <NavItem to="/reconciliation" icon={<RefreshCw size={18} />} label="Reconciliation" />
          <NavItem to="/credit" icon={<CreditCard size={18} />} label="Credit" active />
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            ZeSino <span className="mx-1">/</span> <span className="text-slate-900 font-medium">Credit</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-blue-600">Sign in</Link>
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
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Accounts Receivable</p>
            <h1 className="text-2xl font-semibold text-slate-900">Credit</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor customer-specific amount limits, payment periods, and incoming payments.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
              {error} {error.includes("Sign in") && <Link to="/login" className="underline font-medium">Go to login</Link>}
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-medium text-slate-900">Customer credit controls</h2>
                <p className="text-sm text-slate-500">
                  {loading ? "Loading..." : `${pagination.total} credit ledger rows`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                    placeholder="Search customer..."
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">All statuses</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="WITHIN_LIMIT">Within limit</option>
                  <option value="NEAR_LIMIT">Near limit</option>
                  <option value="SETTLED">Settled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <div className="col-span-2">CUSTOMER</div>
              <div className="col-span-1">OUTSTANDING</div>
              <div className="col-span-1">MAXIMUM LIMIT</div>
              <div className="col-span-1">AVAILABLE CREDIT</div>
              <div className="col-span-1">TRANSACTION DATE</div>
              <div className="col-span-1">DUE DATE</div>
              <div className="col-span-2">TIME STATUS</div>
              <div className="col-span-1">CREDIT STATUS</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            <div className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <div key={account.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-slate-50 transition-colors text-sm">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {account.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-400">{account.code}</p>
                    </div>
                  </div>
                  <div className="col-span-1 font-medium text-slate-900">{account.outstanding}</div>
                  <div className="col-span-1 text-slate-700">{account.maxLimit}</div>
                  <div className="col-span-1 text-slate-700">{account.available}</div>
                  <div className="col-span-1 text-slate-700">{account.transactionDate}</div>
                  <div className="col-span-1 text-slate-700">{account.dueDate}</div>
                  <div className="col-span-2 text-red-600 text-xs font-medium">{account.timeStatus}</div>
                  <div className="col-span-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {account.creditStatus}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">Payment</button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!loading && accounts.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500">No credit records match these filters.</div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {start}–{end} of {pagination.total}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1} className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50">Previous</button>
                <button className="w-8 h-8 bg-slate-900 text-white rounded-lg text-sm">{pagination.page || 1}</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </main>
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
        active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
