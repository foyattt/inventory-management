// frontend/src/pages/ReportsPage.tsx
import { ReactNode, useEffect, useState } from "react";
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
import { ApiError, api, formatMoney } from "../api/client";

interface DashboardData {
  metrics: {
    weeklySales: string;
    weeklyTransactionCount: number;
    productsInStock: number;
    totalProducts: number;
    lowStockCount: number;
    stockValue: string;
  };
  salesByDay: Array<{ date: string; day: string; value: number }>;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    units: number;
    unitCost: number;
  }>;
  recentSales: Array<{
    id: string;
    gatePassNo: string;
    fsNo: string;
    customer: string;
    itemsSold: number;
    recordedAt: string;
    total: string;
  }>;
  period: { from: string; to: string };
}

function NavItem({
  to,
  icon,
  label,
  active = false,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
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

function formatDateLabel(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ success: boolean; data: DashboardData }>(
        "/reports/dashboard"
      );
      setData(res.data);
    } catch (err) {
      setData(null);
      if (err instanceof ApiError && err.status === 401) {
        setError("Sign in to load live reports.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const metrics = data
    ? [
        {
          title: "Weekly sales",
          value: formatMoney(data.metrics.weeklySales),
          subtitle: `${data.metrics.weeklyTransactionCount} live POS transaction${
            data.metrics.weeklyTransactionCount === 1 ? "" : "s"
          } included`,
          status: "success" as const,
        },
        {
          title: "Products in stock",
          value: String(data.metrics.productsInStock),
          subtitle: `${data.metrics.productsInStock} of ${data.metrics.totalProducts} distinct products available`,
          status: "success" as const,
        },
        {
          title: "Low stock items",
          value: String(data.metrics.lowStockCount),
          subtitle: "At or below reorder threshold (< 30)",
          status:
            data.metrics.lowStockCount > 0
              ? ("warning" as const)
              : ("success" as const),
        },
        {
          title: "Stock value",
          value: formatMoney(data.metrics.stockValue),
          subtitle: "Current inventory valuation",
          status: "success" as const,
        },
      ]
    : [];

  const salesData = data?.salesByDay ?? [];
  const maxSales = Math.max(...salesData.map((d) => d.value), 1);
  const stockItems = data?.lowStockItems ?? [];
  const maxUnits = Math.max(...stockItems.map((i) => i.units), 1);
  const recentSales = data?.recentSales ?? [];

  const periodLabel =
    data?.period != null
      ? `${formatDateLabel(data.period.from)} – ${formatDateLabel(data.period.to)}`
      : "Last 7 days";

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-lg">ZeSino</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Workspace
          </p>
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Reports" active />
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" />
          <NavItem
            to="/reconciliation"
            icon={<RefreshCw size={18} />}
            label="Reconciliation"
          />
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            ZeSino <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Reports</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
            <button className="relative p-2 text-slate-500 hover:text-slate-700">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sales and stock analytics for {periodLabel}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void load()}
                className="px-4 py-2 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 flex items-center gap-2"
                title="Export uses on-screen data"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
              {error}{" "}
              {error.includes("Sign in") && (
                <Link to="/login" className="underline font-medium">
                  Go to login
                </Link>
              )}
            </div>
          )}

          {loading && (
            <div className="mb-6 text-sm text-slate-500">Loading live reports…</div>
          )}

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {(loading && !data
              ? [
                  { title: "Weekly sales", value: "—", subtitle: "…", status: "success" },
                  { title: "Products in stock", value: "—", subtitle: "…", status: "success" },
                  { title: "Low stock items", value: "—", subtitle: "…", status: "warning" },
                  { title: "Stock value", value: "—", subtitle: "…", status: "success" },
                ]
              : metrics
            ).map((m) => (
              <div
                key={m.title}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm text-slate-500">{m.title}</p>
                  {m.status === "warning" ? (
                    <AlertTriangle size={16} className="text-amber-500" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  )}
                </div>
                <p className="text-2xl font-semibold text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-400 mt-1">{m.subtitle}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Sales chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-medium text-slate-900">Sales this week</h2>
                  <p className="text-sm text-slate-500">
                    Gate Pass totals by day (last 7 days)
                  </p>
                </div>
              </div>
              <div className="flex items-end gap-2 h-40">
                {salesData.length === 0 && !loading && (
                  <p className="text-sm text-slate-400 self-center w-full text-center">
                    No sales in this period
                  </p>
                )}
                {salesData.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-slate-400">
                      {d.value > 0 ? formatMoney(d.value) : ""}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-blue-500/80 min-h-[4px]"
                      style={{
                        height: `${Math.max(4, (d.value / maxSales) * 100)}%`,
                      }}
                      title={`${d.day}: ${formatMoney(d.value)}`}
                    />
                    <span className="text-xs text-slate-500">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low stock */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-medium text-slate-900">Low stock</h2>
                  <p className="text-sm text-slate-500">
                    Items below reorder threshold
                  </p>
                </div>
                <Link
                  to="/inventory"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View inventory
                </Link>
              </div>
              <div className="space-y-3">
                {stockItems.length === 0 && !loading && (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No low-stock items
                  </p>
                )}
                {stockItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.name}
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {item.units} units
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{item.sku}</p>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.units <= 0
                              ? "bg-red-500"
                              : item.units < 15
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (item.units / Math.max(maxUnits, 30)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent sales */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">Recent sales activity</h2>
                <p className="text-sm text-slate-500">
                  Saved transactions update this report instantly
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Live data
              </span>
            </div>

            <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100">
              <div>TRANSACTION</div>
              <div>CUSTOMER</div>
              <div>ITEMS SOLD</div>
              <div>RECORDED</div>
              <div className="text-right">TOTAL</div>
            </div>

            {recentSales.length === 0 && !loading && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <LayoutDashboard size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  No live sales yet
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Saved POS transactions will appear here.
                </p>
                <Link
                  to="/pos"
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Open Point of Sale
                </Link>
              </div>
            )}

            {recentSales.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-5 gap-4 px-5 py-3 text-sm border-b border-slate-50 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-900">
                  {tx.gatePassNo}
                  <span className="block text-xs text-slate-400 font-normal">
                    {tx.fsNo}
                  </span>
                </div>
                <div className="text-slate-700">{tx.customer}</div>
                <div className="text-slate-700">{tx.itemsSold}</div>
                <div className="text-slate-500 text-xs">
                  {new Date(tx.recordedAt).toLocaleString()}
                </div>
                <div className="text-right font-medium text-slate-900">
                  {formatMoney(tx.total)}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}