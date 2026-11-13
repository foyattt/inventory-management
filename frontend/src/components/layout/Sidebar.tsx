// frontend/src/components/layout/Sidebar.tsx

import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RefreshCw,
  CreditCard,
  Users,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const nav = [
  { to: "/", label: "Reports", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/pos", label: "Point of Sale", icon: ShoppingCart },
  { to: "/reconciliation", label: "Reconciliation", icon: RefreshCw },
  { to: "/credit", label: "Credit", icon: CreditCard },
  { to: "/customer", label: "Customer", icon: Users },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
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
        {nav.map((item) => {
          const active =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
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
  );
}