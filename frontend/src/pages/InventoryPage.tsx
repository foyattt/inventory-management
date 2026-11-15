// frontend/src/pages/InventoryPage.tsx
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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
  primaryUnitCost: number | null;
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

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [qtyDelta, setQtyDelta] = useState("");
  const [qtyReason, setQtyReason] = useState("Manual adjustment");
  const [savingQty, setSavingQty] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "internalCode">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult["data"] | null>(
    null
  );
  const [importing, setImporting] = useState(false);

  // Add product form
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("PCS");
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sortBy,
      sortDir,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sourceType) params.set("sourceType", sourceType);
    if (lowStockOnly) params.set("lowStock", "true");
    return params.toString();
  }, [page, debouncedSearch, sourceType, lowStockOnly, sortBy, sortDir]);

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
          origin: originLabel(
            product.stockSummary.imported,
            product.stockSummary.local
          ),
          price:
            product.primaryUnitCost == null
              ? "—"
              : formatMoney(product.primaryUnitCost),
          stock: product.stockSummary.total,
          status: stockStatus(product.stockSummary.total),
          primaryUnitCost:
            product.primaryUnitCost == null
              ? null
              : Number(product.primaryUnitCost),
        }))
      );
      setPagination(result.pagination);
    } catch (err) {
      setProducts([]);
      if (err instanceof ApiError && err.status === 401) {
        setError("Sign in to load inventory listings.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load inventory"
        );
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

  const handleCreateProduct = async () => {
    if (!newCode.trim() || !newName.trim()) {
      setError("Internal code and name are required.");
      return;
    }
    setSavingProduct(true);
    setError("");
    try {
      await api("/inventory/products", {
        method: "POST",
        body: JSON.stringify({
          internalCode: newCode.trim(),
          name: newName.trim(),
          category: newCategory.trim() || null,
          unitOfMeasure: newUnit.trim() || "PCS",
        }),
      });
      setIsModalOpen(false);
      setNewCode("");
      setNewName("");
      setNewCategory("");
      setNewUnit("PCS");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSavingProduct(false);
    }
  };

  const openQtyEditor = (product: ProductRow) => {
    setEditProduct(product);
    setQtyDelta("");
    setQtyReason("Manual adjustment");
    setIsQtyModalOpen(true);
  };

  const handleAdjustQuantity = async () => {
    if (!editProduct) return;
    const delta = Number(qtyDelta);
    if (!delta || Number.isNaN(delta)) {
      setError(
        "Enter a non-zero quantity change (positive to add, negative to remove)."
      );
      return;
    }
    setSavingQty(true);
    setError("");
    try {
      await api("/inventory/adjustments", {
        method: "POST",
        body: JSON.stringify({
          productId: editProduct.id,
          quantity: delta,
          reason: qtyReason.trim() || "Manual adjustment",
        }),
      });
      setIsQtyModalOpen(false);
      setEditProduct(null);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to adjust quantity"
      );
    } finally {
      setSavingQty(false);
    }
  };

  const toggleSort = (field: "name" | "internalCode") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const start =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

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
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Reports" />
          <NavItem
            to="/inventory"
            icon={<Package size={18} />}
            label="Inventory"
            active
          />
          <NavItem
            to="/pos"
            icon={<ShoppingCart size={18} />}
            label="Point of Sale"
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
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            ZeSino <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Inventory</span>
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
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Catalogue
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Inventory
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Search, filter by low stock, sort by name, and adjust quantities.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2.5 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Download size={16} />
                Import
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add new product
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

          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-96">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name or code…"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={sourceType}
                  onChange={(e) => {
                    setSourceType(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="">All origins</option>
                  <option value="IMPORTED">Imported</option>
                  <option value="LOCAL">Local</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setLowStockOnly((v) => !v);
                    setPage(1);
                  }}
                  className={`text-sm px-3 py-2 rounded-lg border flex items-center gap-1.5 ${
                    lowStockOnly
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={14} />
                  Low stock
                  {lowStockOnly && <X size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Name {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSort("internalCode")}
                  className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Code{" "}
                  {sortBy === "internalCode"
                    ? sortDir === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">CODE</th>
                    <th className="text-left px-5 py-3 font-medium">PRODUCT</th>
                    <th className="text-left px-5 py-3 font-medium">CATEGORY</th>
                    <th className="text-left px-5 py-3 font-medium">ORIGIN</th>
                    <th className="text-left px-5 py-3 font-medium">PRICE</th>
                    <th className="text-left px-5 py-3 font-medium">STOCK</th>
                    <th className="text-left px-5 py-3 font-medium">STATUS</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && products.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-sm text-slate-500 text-center"
                      >
                        No products match these filters.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {p.internalCode}
                        </td>
                        <td className="px-5 py-3 text-slate-900">{p.name}</td>
                        <td className="px-5 py-3 text-slate-600">
                          {p.category || "—"}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{p.origin}</td>
                        <td className="px-5 py-3 text-slate-900">{p.price}</td>
                        <td className="px-5 py-3 font-medium">{p.stock}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                              p.status === "In Stock"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "Reorder Required"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Edit quantity"
                              onClick={() => openQtyEditor(p)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
              <span>
                Showing {start}–{end} of {pagination.total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add product modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Add new product
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Internal code *
                </label>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Name *
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Category
                </label>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Unit of measure
                </label>
                <input
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingProduct}
                onClick={handleCreateProduct}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {savingProduct ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Import products
            </h2>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setImportFile(e.target.files?.[0] || null)
              }
              className="block w-full text-sm"
            />
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Download CSV template
            </button>
            {importResult && (
              <div className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                Created: {importResult.created}, Stock sources:{" "}
                {importResult.stockSourcesCreated}, Duplicates:{" "}
                {importResult.duplicates}, Failed: {importResult.failed}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsImportOpen(false);
                  setImportResult(null);
                  setImportFile(null);
                }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                disabled={importing || !importFile}
                onClick={onImport}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {importing ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity edit modal */}
      {isQtyModalOpen && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              Adjust quantity
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {editProduct.name} ({editProduct.internalCode}) · Current stock:{" "}
              {editProduct.stock}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Change (+ to add, − to remove) *
                </label>
                <input
                  type="number"
                  step="1"
                  value={qtyDelta}
                  onChange={(e) => setQtyDelta(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 10 or -5"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Reason
                </label>
                <input
                  value={qtyReason}
                  onChange={(e) => setQtyReason(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsQtyModalOpen(false);
                  setEditProduct(null);
                }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingQty}
                onClick={handleAdjustQuantity}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {savingQty ? "Saving…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}