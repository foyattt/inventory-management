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
  AlertTriangle,
  Pencil,
} from "lucide-react";

export default function CreditPage() {
  const creditAccounts = [
    {
      name: "Northstar Trading Co.",
      code: "CUS-001",
      outstanding: "$94,200.00",
      maxLimit: "$120,000.00",
      available: "$25,800.00",
      transactionDate: "2025-05-03",
      dueDate: "2025-06-02",
      timeStatus: "519 days overdue",
      creditStatus: "Overdue",
    },
    {
      name: "Atlas Retail Group",
      code: "CUS-002",
      outstanding: "$68,100.00",
      maxLimit: "$75,000.00",
      available: "$6,900.00",
      transactionDate: "2025-04-26",
      dueDate: "2025-05-26",
      timeStatus: "526 days overdue",
      creditStatus: "Overdue",
    },
    {
      name: "Mara Foods Ltd.",
      code: "CUS-003",
      outstanding: "$50,000.00",
      maxLimit: "$50,000.00",
      available: "$0.00",
      transactionDate: "2025-04-19",
      dueDate: "2025-05-19",
      timeStatus: "533 days overdue",
      creditStatus: "Overdue",
    },
    {
      name: "Samuel Koto",
      code: "CUS-004",
      outstanding: "$32,400.00",
      maxLimit: "$40,000.00",
      available: "$7,600.00",
      transactionDate: "2025-05-12",
      dueDate: "2025-06-12",
      timeStatus: "509 days overdue",
      creditStatus: "Overdue",
    },
  ];

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
            <span className="text-slate-900 font-medium">Credit</span>
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
              Accounts Receivable
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Credit</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor customer-specific amount limits, payment periods, and incoming payments.
            </p>
          </div>

          {/* Top metric cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Total outstanding */}
            <div className="bg-slate-900 text-white rounded-xl p-5 relative overflow-hidden">
              <p className="text-sm text-slate-300">Total outstanding credit</p>
              <p className="text-3xl font-semibold mt-1">$244,700.00</p>
              <p className="text-xs text-slate-400 mt-2">Live customer balances after recorded payments</p>
              <div className="absolute top-4 right-4 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                Across 4 active accounts
              </div>
            </div>

            {/* Overdue accounts */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 relative">
              <div className="absolute top-4 right-4">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <p className="text-sm text-slate-500">Overdue accounts</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">4</p>
              <p className="text-xs text-slate-400 mt-2">Past POS/OSL past due</p>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Review balances <ArrowRight size={14} />
              </button>
            </div>

            {/* Available credit */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Available credit</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">$150,300</p>
              <p className="text-xs text-slate-400 mt-2">Across all configured customer limits</p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Additional credit requires authorisation
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                4 customer accounts are overdue. Review payment history before extending more credit.
              </p>
            </div>
          </div>

          {/* Customer credit controls */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-medium text-slate-900">Customer credit controls</h2>
                <p className="text-sm text-slate-500">
                  Monetary and time-based limits linked to Customer records
                </p>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer..."
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>

            {/* Table header */}
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

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {creditAccounts.map((account) => (
                <div
                  key={account.code}
                  className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-slate-50 transition-colors text-sm"
                >
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
                    <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">
                      Payment
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>
              ))}
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