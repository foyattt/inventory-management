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
  const [newQuantity, setNewQuantity] = useState<string>("0");          // ← editable quantity
  const [newSourceType, setNewSourceType] = useState<"LOCAL" | "IMPORTED">("LOCAL");
  const [newUnitCost, setNewUnitCost] = useState<string>("");
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
        (result.data || []).map((product) => ({
          id: product.id,
          internalCode: product.internalCode,
          name: product.name,
          category: product.category,
          origin: originLabel(
            product.stockSummary.imported,
            product.stockSummary.local
          ),
          price: formatMoney(product.primaryUnitCost),
          stock: product.stockSummary.total,
          status: stockStatus(product.stockSummary.total),
          primaryUnitCost:
            product.primaryUnitCost != null
              ? Number(product.primaryUnitCost)
              : null,
        }))
      );
      setPagination(
        result.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, [query]);

  const downloadTemplate = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? "/api"}/inventory/import/template`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
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

  const onImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const result = await api<ImportResult>("/inventory/import", {
        method: "POST",
        body: formData,
      });
      setImportResult(result.data);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const resetNewProductForm = () => {
    setNewCode("");
    setNewName("");
    setNewCategory("");
    setNewUnit("PCS");
    setNewQuantity("0");
    setNewSourceType("LOCAL");
    setNewUnitCost("");
  };

  const handleCreateProduct = async () => {
    if (!newCode.trim() || !newName.trim()) {
      setError("Internal code and name are required.");
      return;
    }

    const qty = Number(newQuantity);
    if (Number.isNaN(qty) || qty < 0) {
      setError("Quantity must be a non-negative number.");
      return;
    }

    setSavingProduct(true);
    setError("");
    try {
      // 1. Create the product
      const created = await api<{
        success: boolean;
        data: { id: string; internalCode: string; name: string };
      }>("/inventory/products", {
        method: "POST",
        body: JSON.stringify({
          internalCode: newCode.trim(),
          name: newName.trim(),
          category: newCategory.trim() || null,
          unitOfMeasure: newUnit.trim() || "PCS",
        }),
      });

      // 2. If quantity > 0, create an initial stock source
      if (qty > 0 && created.data?.id) {
        const batchCode = `INIT-${Date.now().toString(36).toUpperCase()}`;
        await api("/inventory/stock-sources", {
          method: "POST",
          body: JSON.stringify({
            productId: created.data.id,
            sourceType: newSourceType,
            batchCode,
            receiptDate: new Date().toISOString().slice(0, 10),
            receivedQty: qty,
            unitCost: newUnitCost.trim() === "" ? null : Number(newUnitCost),
            notes: "Initial stock on product creation",
          }),
        });
      }

      setIsModalOpen(false);
      resetNewProductForm();
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

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            ZeSino <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Inventory</span>
          </div>
          <div className="flex items-center gap-4">
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
                Stock Control
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
              <p className="text-sm text-slate-500 mt-1">
                Search, filter by low stock, sort by name, and adjust quantities.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <Download size={16} />
                Import
              </button>
              <button
                onClick={() => {
                  resetNewProductForm();
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-80">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or internal code..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={sourceType}
                  onChange={(e) => {
                    setSourceType(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">All origins</option>
                  <option value="IMPORTED">Imported</option>
                  <option value="LOCAL">Local</option>
                </select>
                <button
                  onClick={() => {
                    setLowStockOnly((v) => !v);
                    setPage(1);
                  }}
                  className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-1.5 ${
                    lowStockOnly
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={14} />
                  Low stock
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="p-1">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th
                      className="text-left px-5 py-3 font-medium cursor-pointer"
                      onClick={() => toggleSort("internalCode")}
                    >
                      Code {sortBy === "internalCode" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="text-left px-5 py-3 font-medium cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      Name {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-left px-5 py-3 font-medium">Category</th>
                    <th className="text-left px-5 py-3 font-medium">Origin</th>
                    <th className="text-left px-5 py-3 font-medium">Unit cost</th>
                    <th className="text-left px-5 py-3 font-medium">Stock</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                        Loading products…
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs">{p.internalCode}</td>
                        <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                        <td className="px-5 py-3">{p.category || "—"}</td>
                        <td className="px-5 py-3">{p.origin}</td>
                        <td className="px-5 py-3">{p.price}</td>
                        <td className="px-5 py-3 font-medium">{p.stock}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "In Stock"
                                ? "bg-emerald-100 text-emerald-700"
                                : p.status === "Reorder Required"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => openQtyEditor(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit quantity"
                          >
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total}{" "}
                  products
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========== Add New Product Modal (with editable Quantity) ========== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
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
                  placeholder="e.g. PRD-001"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Name *</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Category</label>
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
                  placeholder="PCS"
                />
              </div>

              {/* Editable quantity field */}
              <div className="border-t border-slate-100 pt-3 mt-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial quantity
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave 0 to create the product with no stock. You can adjust later.
                </p>
              </div>

              {Number(newQuantity) > 0 && (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Source type
                    </label>
                    <select
                      value={newSourceType}
                      onChange={(e) =>
                        setNewSourceType(e.target.value as "LOCAL" | "IMPORTED")
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="LOCAL">Local</option>
                      <option value="IMPORTED">Imported</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Unit cost (optional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={newUnitCost}
                      onChange={(e) => setNewUnitCost(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetNewProductForm();
                }}
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

      {/* Quantity adjust modal */}
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
                  Quantity change (+ to add, − to remove)
                </label>
                <input
                  type="number"
                  value={qtyDelta}
                  onChange={(e) => setQtyDelta(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 10 or -5"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Reason</label>
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