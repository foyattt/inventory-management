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
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  HelpCircle,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const products = [
    {
      partNumber: "LOC-20387",
      name: "Countertop Display Stand",
      sku: "SKU-TV-DSP-015",
      origin: "Local",
      price: "$42.75",
      stock: 73,
      status: "In Stock",
    },
    {
      partNumber: "IMP-10993",
      name: "Industrial Label Printer",
      sku: "SKU-IL-PRN-302",
      origin: "Imported",
      price: "$346.00",
      stock: 18,
      status: "Reorder Required",
    },
    {
      partNumber: "LOC-20145",
      name: "Kraft Shopping Bag – Large",
      sku: "SKU-PK-BAG-120",
      origin: "Local",
      price: "$1.85",
      stock: 860,
      status: "In Stock",
    },
    {
      partNumber: "IMP-10574",
      name: "POS Terminal X4",
      sku: "SKU-EL-POS-101",
      origin: "Imported",
      price: "$820.00",
      stock: 0,
      status: "Out of Stock",
    },
    {
      partNumber: "LOC-20819",
      name: "Thermal Receipt Paper (80mm)",
      sku: "SKU-PK-RCP-080",
      origin: "Local",
      price: "$3.20",
      stock: 24,
      status: "Reorder Required",
    },
    {
      partNumber: "IMP-10482",
      name: "Wireless Barcode Scanner",
      sku: "SKU-EL-SCN-204",
      origin: "Imported",
      price: "$128.50",
      stock: 148,
      status: "In Stock",
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
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" active />
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" />
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
            <span className="text-slate-900 font-medium">Inventory</span>
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
                Weekly Stock Report
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Product inventory</h1>
              <p className="text-sm text-slate-500 mt-1">
                Track weekly stock levels and transaction movement.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add new product
            </button>
          </div>

          {/* Search + Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search product, part number, or SKU..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg">All</button>
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                  Imported
                </button>
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                  Local
                </button>
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                  <Filter size={14} />
                  Sort: Name
                </button>
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                  <Download size={14} />
                  Excel importer
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">All products</h2>
                <p className="text-sm text-slate-500">6 products in catalogue</p>
              </div>
              <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
                <Download size={14} />
                Export inventory
              </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <div className="col-span-2">PART NUMBER</div>
              <div className="col-span-3">PRODUCT NAME</div>
              <div className="col-span-1">ORIGIN TYPE</div>
              <div className="col-span-1">UNIT PRICE</div>
              <div className="col-span-1">STOCK LEVEL</div>
              <div className="col-span-2">STOCK STATUS</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-slate-100">
              {products.map((product) => (
                <div
                  key={product.partNumber}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-2 text-sm font-medium text-slate-900">
                    {product.partNumber}
                  </div>

                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sku}</p>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        product.origin === "Local" ? "text-emerald-600" : "text-blue-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.origin === "Local" ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                      ></span>
                      {product.origin}
                    </span>
                  </div>

                  <div className="col-span-1 text-sm text-slate-700">{product.price}</div>
                  <div className="col-span-1 text-sm text-slate-700">{product.stock} units</div>
                  <div className="col-span-2">
                    <StatusBadge status={product.status} />
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing 1–6 of 6</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="w-8 h-8 bg-slate-900 text-white rounded-lg text-sm">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add new product</h2>
                <p className="text-sm text-slate-500">Create a new inventory record</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Part number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LOC-20418"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PA-RCP-100"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product name
                </label>
                <input
                  type="text"
                  placeholder="Product name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Origin type
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option>Local</option>
                    <option>Imported</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit price
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Stock level
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
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
                Add product
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
  const styles: Record<string, string> = {
    "In Stock": "bg-emerald-50 text-emerald-700",
    "Reorder Required": "bg-amber-50 text-amber-700",
    "Out of Stock": "bg-red-50 text-red-700",
  };

  const dots: Record<string, string> = {
    "In Stock": "bg-emerald-500",
    "Reorder Required": "bg-amber-500",
    "Out of Stock": "bg-red-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></span>
      {status}
    </span>
  );
}