import { ReactNode } from "react";
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
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function ReconciliationPage() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
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
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" />
          <NavItem to="/reconciliation" icon={<RefreshCw size={18} />} label="Reconciliation" active />
          <NavItem to="/credit" icon={<CreditCard size={18} />} label="Credit" />
          <NavItem to="/customer" icon={<Users size={18} />} label="Customer" />
        </nav>

        <div className="p-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-blue-400" />
              <span className="text-sm font-medium">Need assistance?</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Visit the operations help center.
            </p>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Open help center <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            Stockwise <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Reconciliation</span>
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

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Finance & Compliance
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Gate Pass & invoice reconciliation
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Compare saved products, quantities, prices, tax, and totals without changing inventory.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 relative">
              <div className="absolute top-4 right-4">
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <p className="text-sm text-slate-500">Transactions checked</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">0</p>
              <p className="text-xs text-slate-400 mt-2">Received live from Point of Sale</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 relative">
              <div className="absolute top-4 right-4">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <p className="text-sm text-slate-500">Flagged discrepancies</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">0</p>
              <p className="text-xs text-slate-400 mt-2">Product or value differences</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 relative">
              <div className="absolute top-4 right-4">
                <Clock size={18} className="text-amber-500" />
              </div>
              <p className="text-sm text-slate-500">Reviewed</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">0</p>
              <p className="text-xs text-slate-400 mt-2">Closed with an audit note</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Independent records, controlled review
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Reconciliation never modifies saved items, tax values, totals, or inventory stock.
              </p>
            </div>
          </div>

          {/* Saved transactions */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-medium text-slate-900">Saved transactions</h2>
                <p className="text-sm text-slate-500">
                  Search by Gate Pass No., FS No., customer, date, or status
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Gate Pass, FS No., or customer"
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <button className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                  dd/mm/yyyy
                </button>
                <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                  <option>All statuses</option>
                  <option>Pending</option>
                  <option>Matched</option>
                  <option>Discrepancy</option>
                </select>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-7 gap-4 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <div>GATE PASS / FS NO.</div>
              <div>CUSTOMER</div>
              <div>TRANSACTION DATE</div>
              <div>GATE PASS TOTAL</div>
              <div>INVOICE TOTAL</div>
              <div>FINAL DIFFERENCE</div>
              <div>STATUS</div>
            </div>

            {/* Empty state */}
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Search size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No saved transactions match these filters
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Transactions from Point of Sale will appear here after they are saved.
              </p>
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