import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
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
import { ApiError, api, formatMoney, getToken } from "../api/client";

interface ProductRow {
  id: string;
  internalCode: string;
  name: string;
  category: string | null;
  origin: string;
  price: string;
  stock: number;
  status: string;
}

interface ProductsResponse {
  success: boolean;
  data: Array<{
    id: string;
    internalCode: string;
    name: string;
    category: string | null;
    primaryUnitCost: string | number | null;
    stockSummary: { imported: number; local: number; total: number };
  }>;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface ImportResult {
  success: boolean;
  data: {
    created: number;
    stockSourcesCreated: number;
    duplicates: number;
    skipped: number;
    failed: number;
    errors: Array<{ row: number; internalCode: string | null; message: string }>;
  };
}

function stockStatus(total: number): string {
  if (total <= 0) return "Out of Stock";
  if (total < 30) return "Reorder Required";
  return "In Stock";
}

function originLabel(imported: number, local: number): string {
  if (imported > 0 && local > 0) return "Mixed";
  if (imported > 0) return "Imported";
  return "Local";
}

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult["data"] | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sourceType) params.set("sourceType", sourceType);
    return params.toString();
  }, [page, debouncedSearch, sourceType]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<ProductsResponse>(`/inventory/products?${query}`);
      setProducts(
        result.data.map((product) => ({
          id: product.id,
          internalCode: product.internalCode,
          name: product.name,
          category: product.category,
          origin: originLabel(product.stockSummary.imported, product.stockSummary.local),
          price: product.primaryUnitCost == null ? "—" : formatMoney(product.primaryUnitCost),
          stock: product.stockSummary.total,
          status: stockStatus(product.stockSummary.total),
        }))
      );
      setPagination(result.pagination);
    } catch (err) {
      setProducts([]);
      if (err instanceof ApiError && err.status === 401) {
        setError("Sign in to load inventory listings.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load inventory");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, [query]);

  const onImport = async () => {
    if (!importFile) {
      setError("Choose a CSV or Excel file to import.");
      return;
    }
    setImporting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", importFile);
      const result = await api<ImportResult>("/inventory/import", {
        method: "POST",
        body: form,
      });
      setImportResult(result.data);
      await loadProducts();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Sign in to use Excel importer.");
      } else {
        setError(err instanceof Error ? err.message : "Import failed");
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/inventory/import/template", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error("Could not download template");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "inventory-import-template.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Template download failed");
    }
  };

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex h-screen bg-slate-50">
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
            Stockwise <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Inventory</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Catalogue
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
              <p className="text-sm text-slate-500 mt-1">
                Search, filter, and import products without changing the rest of the catalogue workflow.
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

          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search product, part number, or SKU..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setSourceType("");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg ${sourceType === "" ? "bg-slate-900 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setSourceType("IMPORTED");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg ${sourceType === "IMPORTED" ? "bg-slate-900 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                >
                  Imported
                </button>
                <button
                  onClick={() => {
                    setSourceType("LOCAL");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg ${sourceType === "LOCAL" ? "bg-slate-900 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                >
                  Local
                </button>
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                  <Filter size={14} />
                  Sort: Name
                </button>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Download size={14} />
                  Excel importer
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">All products</h2>
                <p className="text-sm text-slate-500">
                  {loading ? "Loading..." : `${pagination.total} products in catalogue`}
                </p>
              </div>
              <button className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
                <Download size={14} />
                Export inventory
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100 bg-slate-50">
              <div className="col-span-2">PART NUMBER</div>
              <div className="col-span-3">PRODUCT NAME</div>
              <div className="col-span-1">ORIGIN TYPE</div>
              <div className="col-span-1">UNIT PRICE</div>
              <div className="col-span-1">STOCK LEVEL</div>
              <div className="col-span-2">STOCK STATUS</div>
              <div className="col-span-2 text-right">ACTIONS</div>
            </div>

            <div className="divide-y divide-slate-100">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-2 text-sm font-medium text-slate-900">
                    {product.internalCode}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.category || "Uncategorised"}</p>
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
              {!loading && products.length === 0 && (
                <div className="px-5 py-10 text-sm text-slate-500 text-center">No products match these filters.</div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>
                Showing {start}–{end} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button className="w-8 h-8 bg-slate-900 text-white rounded-lg text-sm">{pagination.page || 1}</button>
                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
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
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Part number</label>
                  <input type="text" placeholder="e.g. LOC-20418" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU</label>
                  <input type="text" placeholder="e.g. PA-RCP-100" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product name</label>
                <input type="text" placeholder="Product name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add product
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsImportOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Excel importer</h2>
                <p className="text-sm text-slate-500">Upload CSV or Excel to create products and opening stock.</p>
              </div>
              <button onClick={() => setIsImportOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <button onClick={() => void downloadTemplate()} className="text-sm text-blue-600 hover:text-blue-700">
                Download CSV template
              </button>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setImportResult(null);
                  setImportFile(event.target.files?.[0] || null);
                }}
                className="block w-full text-sm text-slate-600"
              />
              {importResult && (
                <div className="text-sm bg-slate-50 rounded-lg p-3 space-y-1">
                  <p>Created products: {importResult.created}</p>
                  <p>Stock batches created: {importResult.stockSourcesCreated}</p>
                  <p>Duplicates: {importResult.duplicates}</p>
                  <p>Failed rows: {importResult.failed}</p>
                  {importResult.errors.slice(0, 8).map((item) => (
                    <p key={`${item.row}-${item.message}`} className="text-red-600">
                      Row {item.row}: {item.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setIsImportOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Close
              </button>
              <button
                onClick={() => void onImport()}
                disabled={importing}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {importing ? "Importing..." : "Import file"}
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
        active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
