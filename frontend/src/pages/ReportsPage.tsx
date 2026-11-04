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
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function ReportsPage() {
  const metrics = [
    {
      title: "Weekly sales",
      value: "$171,590",
      subtitle: "5 live POS transactions included",
      status: "success",
    },
    {
      title: "Products in stock",
      value: "5",
      subtitle: "5 of 5 distinct products available",
      status: "success",
    },
    {
      title: "Low stock items",
      value: "3",
      subtitle: "At or below reorder threshold",
      status: "warning",
    },
    {
      title: "Stock value",
      value: "$30,035",
      subtitle: "Current inventory valuation",
      status: "success",
    },
  ];

  const salesData = [
    { day: "Mon", value: 45 },
    { day: "Tue", value: 52 },
    { day: "Wed", value: 38 },
    { day: "Thu", value: 65 },
    { day: "Fri", value: 72 },
    { day: "Sat", value: 68 },
    { day: "Sun", value: 85 },
  ];

  const stockItems = [
    { name: "POS Terminal X4", sku: "SKU-001A", units: 0, max: 50 },
    { name: "Industrial Label Printer", sku: "SKU-002B", units: 18, max: 50 },
    { name: "Thermal Receipt Paper (80mm)", sku: "SKU-003C", units: 24, max: 100 },
    { name: "Countertop Display Stand", sku: "SKU-004D", units: 73, max: 100 },
    { name: "Wireless Barcode Scanner", sku: "SKU-005E", units: 148, max: 200 },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-lg">Stockwise</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Workspace
          </p>

          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Reports" active />
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" />
          <NavItem to="/reconciliation" icon={<RefreshCw size={18} />} label="Reconciliation" />
          <NavItem to="/credit" icon={<CreditCard size={18} />} label="Credit" />
          <NavItem to="/customer" icon={<Users size={18} />} label="Customer" />
        </nav>

        {/* Help box */}
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
            <span className="text-slate-900 font-medium">Reports</span>
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sales and stock analytics for 19–25 May 2025.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-2">
                This week
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download size={16} />
                Export report
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {metrics.map((m) => (
              <div key={m.title} className="bg-white rounded-xl border border-slate-200 p-5 relative">
                <div className="absolute top-4 right-4">
                  {m.status === "success" ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500">{m.title}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{m.value}</p>
                <p className="text-xs text-slate-400 mt-2">{m.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Sales performance */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-medium text-slate-900">Sales performance</h2>
                  <p className="text-sm text-slate-500">Daily gross sales</p>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  +12.4% vs last week
                </span>
              </div>

              {/* Simple bar chart */}
              <div className="flex items-end justify-between h-48 gap-3">
                {salesData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative flex items-end justify-center h-40">
                      <div
                        className="w-full max-w-[48px] bg-blue-500 rounded-t-md transition-all"
                        style={{ height: `${d.value}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock health */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-medium text-slate-900">Stock health</h2>
                  <p className="text-sm text-slate-500">Items requiring attention</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View inventory <ArrowRight size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {stockItems.map((item) => (
                  <div key={item.sku}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.sku}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.units === 0
                                  ? "bg-red-500"
                                  : item.units < 30
                                  ? "bg-amber-400"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min((item.units / item.max) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {item.units} units
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent sales activity */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">Recent sales activity</h2>
                <p className="text-sm text-slate-500">Saved transactions update this report instantly</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Live data
              </span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100">
              <div>TRANSACTION</div>
              <div>CUSTOMER</div>
              <div>ITEMS SOLD</div>
              <div>RECORDED</div>
              <div className="text-right">TOTAL</div>
            </div>

            {/* Empty state */}
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <LayoutDashboard size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">No live sales yet</p>
              <p className="text-sm text-slate-400 mt-1">Saved POS transactions will appear here.</p>
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