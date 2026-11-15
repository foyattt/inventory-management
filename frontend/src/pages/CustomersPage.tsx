import { ReactNode, useCallback, useEffect, useState } from "react";
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
import { formatMoney, ApiError } from "../api/client";
import {
  getCustomers,
  getCustomerById,
  type Customer,
} from "../features/customers/api";
import { CustomerForm } from "../features/customers/components/CustomerForm";
import { CustomerHistory } from "../features/customers/components/CustomerHistory";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INDIVIDUAL" | "COMPANY">("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Detail / history panel
  const [selectedCustomer, setSelectedCustomer] = useState<
    (Customer & { outstandingBalance?: string; availableCredit?: string }) | null
  >(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getCustomers({
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      });

      let list = result.data || [];
      // Client-side type filter (backend search is free-text only)
      if (typeFilter !== "ALL") {
        list = list.filter((c) => c.customerType === typeFilter);
      }

      setCustomers(list);
      setPagination(
        result.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load customers";
      setError(message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, typeFilter]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const openCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setIsModalOpen(true);
  };

  const handleFormSuccess = (saved: Customer) => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    void loadCustomers();
    // Refresh detail panel if the same customer is open
    if (selectedCustomer?.id === saved.id) {
      void openDetail(saved.id);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedCustomer(null);
    try {
      const res = await getCustomerById(id);
      setSelectedCustomer(res.data as any);
    } catch {
      setSelectedCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setSelectedCustomer(null);

  const typeLabel = (t: string) =>
    t === "COMPANY" ? "Company" : "Individual";

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
          <NavItem to="/inventory" icon={<Package size={18} />} label="Inventory" />
          <NavItem to="/pos" icon={<ShoppingCart size={18} />} label="Point of Sale" />
          <NavItem
            to="/reconciliation"
            icon={<RefreshCw size={18} />}
            label="Reconciliation"
          />
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
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            ZeSino <span className="mx-1">/</span>{" "}
            <span className="text-slate-900 font-medium">Customer</span>
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
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Customer Records
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">Customer</h1>
              <p className="text-sm text-slate-500 mt-1">
                Register people and companies, then manage transaction and credit
                history from one record.
              </p>
            </div>
            <button
              onClick={openCreate}
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
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, TIN, or phone..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All types</option>
                <option value="COMPANY">Company</option>
                <option value="INDIVIDUAL">Individual</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">Registered customers</h2>
                <p className="text-sm text-slate-500">
                  {pagination.total} record{pagination.total !== 1 ? "s" : ""}{" "}
                  available to Point of Sale
                </p>
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
              <div className="col-span-2">CREDIT LIMIT</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  Loading customers…
                </div>
              ) : customers.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No customers found. Create the first one.
                </div>
              ) : (
                customers.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => openDetail(c.id)}
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">
                          {c.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          c.customerType === "COMPANY"
                            ? "text-blue-600"
                            : "text-emerald-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.customerType === "COMPANY"
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {typeLabel(c.customerType)}
                      </span>
                    </div>

                    <div className="col-span-2 text-sm text-slate-700">
                      {c.tinNo || "—"}
                    </div>
                    <div className="col-span-2 text-sm text-slate-700">
                      {c.phone || "—"}
                    </div>
                    <div className="col-span-2 text-sm font-medium text-slate-900">
                      {formatMoney(c.creditLimit)}
                    </div>

                    <div className="col-span-1">
                      <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
                    </div>

                    <div
                      className="col-span-1 flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openDetail(c.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View details"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingCustomer ? "Edit Customer" : "Add Customer"}
                </h2>
                <p className="text-sm text-slate-500">
                  {editingCustomer
                    ? "Update customer details"
                    : "Register a new person or company"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <CustomerForm
                initial={editingCustomer}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail / History side panel */}
      {(selectedCustomer || detailLoading) && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={closeDetail} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Customer detail</h3>
              <button
                onClick={closeDetail}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 text-sm text-slate-500">Loading…</div>
            ) : selectedCustomer ? (
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {typeLabel(selectedCustomer.customerType)} ·{" "}
                    {selectedCustomer.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">TIN</p>
                    <p className="font-medium">{selectedCustomer.tinNo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium">{selectedCustomer.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Credit limit</p>
                    <p className="font-medium">
                      {formatMoney(selectedCustomer.creditLimit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Outstanding</p>
                    <p className="font-medium">
                      {formatMoney(
                        (selectedCustomer as any).outstandingBalance ?? 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Available credit</p>
                    <p className="font-medium">
                      {formatMoney(
                        (selectedCustomer as any).availableCredit ?? 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Credit period</p>
                    <p className="font-medium">
                      {selectedCustomer.creditPeriodDays} days
                    </p>
                  </div>
                </div>

                {selectedCustomer.email && (
                  <div className="text-sm">
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="text-sm">
                    <p className="text-slate-500">Address</p>
                    <p className="font-medium">{selectedCustomer.address}</p>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-900">
                      Recent transactions
                    </h4>
                    <button
                      onClick={() => openEdit(selectedCustomer)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit customer
                    </button>
                  </div>
                  <CustomerHistory customerId={selectedCustomer.id} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Local helpers ─── */

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
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}