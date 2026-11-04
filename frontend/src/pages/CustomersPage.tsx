import { ReactNode, useState } from "react";
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
  Plus,
  Pencil,
  X,
} from "lucide-react";

export default function CustomerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const customers = [
    {
      name: "Northstar Trading Co.",
      code: "CUS-001",
      type: "Company",
      tin: "TIN 185104",
      phone: "+251 911 204 822",
      credit: "$94,200.00",
      status: "Overdue",
    },
    {
      name: "Atlas Retail Group",
      code: "CUS-002",
      type: "Company",
      tin: "TIN 441890",
      phone: "+251 911 268 610",
      credit: "$68,100.00",
      status: "Overdue",
    },
    {
      name: "Mara Foods Ltd.",
      code: "CUS-003",
      type: "Company",
      tin: "TIN 319284",
      phone: "+251 922 140 509",
      credit: "$50,000.00",
      status: "Overdue",
    },
    {
      name: "Samuel Koto",
      code: "CUS-004",
      type: "Individual",
      tin: "TIN 220145",
      phone: "+251 933 420 811",
      credit: "$32,400.00",
      status: "Overdue",
    },
    {
      name: "Cedar & Co. Supply",
      code: "CUS-005",
      type: "Company",
      tin: "TIN 852742",
      phone: "+251 911 882 004",
      credit: "$0.00",
      status: "Within Limit",
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
          <NavItem to="/credit" icon={<CreditCard size={18} />} label="Credit" />
          <NavItem to="/customer" icon={<Users size={18} />} label="Customer" active />
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
            <span className="text-slate-900 font-medium">Customer</span>
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
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Customer Records
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Customer</h1>
              <p className="text-sm text-slate-500 mt-1">
                Register people and companies, then manage transaction and credit history from one record.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>

          {/* Search + Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, TIN, or phone..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option>All types</option>
                <option>Company</option>
                <option>Individual</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">Registered customers</h2>
                <p className="text-sm text-slate-500">5 records available to Point of Sale</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Live POS sync
              </span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <div className="col-span-3">CUSTOMER NAME</div>
              <div className="col-span-1">CUSTOMER TYPE</div>
              <div className="col-span-2">TIN NO.</div>
              <div className="col-span-2">PHONE NUMBER</div>
              <div className="col-span-2">CURRENT OUTSTANDING CREDIT</div>
              <div className="col-span-1">CREDIT STATUS</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {customers.map((c) => (
                <div
                  key={c.code}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.code}</p>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        c.type === "Company" ? "text-blue-600" : "text-emerald-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.type === "Company" ? "bg-blue-500" : "bg-emerald-500"
                        }`}
                      ></span>
                      {c.type}
                    </span>
                  </div>

                  <div className="col-span-2 text-sm text-slate-700">{c.tin}</div>
                  <div className="col-span-2 text-sm text-slate-700">{c.phone}</div>
                  <div className="col-span-2 text-sm font-medium text-slate-900">{c.credit}</div>

                  <div className="col-span-1">
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <ArrowRight size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add Customer</h2>
                <p className="text-sm text-slate-500">Register a new person or company</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Customer type
                </label>
                <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Company</option>
                  <option>Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full name / Company name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    TIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="TIN XXXXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone number
                  </label>
                  <input
                    type="text"
                    placeholder="+251 ..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Credit limit (optional)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
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

function StatusBadge({ status }: { status: string }) {
  const isOverdue = status === "Overdue";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isOverdue ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? "bg-red-500" : "bg-emerald-500"}`}></span>
      {status}
    </span>
  );
}