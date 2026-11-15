// frontend/src/pages/PosPage.tsx
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
} from "lucide-react";
import { PosForm } from "../features/pos/components/PosForm";

function NavItem({
  to,
  icon,
  label,
  active = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function PosPage() {
  return (
    <div className="flex h-screen bg-slate-50">
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
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Reports" />
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavItem
            to="/pos"
            icon={<ShoppingCart size={18} />}
            label="Point of Sale"
            active
          />
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
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-slate-500">
            ZeSino <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Point of Sale</span>
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
              <span>{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</span>
            </div>
          </div>
        </header>

        <PosForm />
      </div>
    </div>
  );
}