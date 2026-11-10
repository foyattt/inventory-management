// frontend/src/components/layout/PrimaryNav.tsx

// Re-exports the same nav items used by Sidebar for consistency.
// You can import this if you ever need a horizontal top nav.

export const PRIMARY_NAV = [
    { to: "/", label: "Reports" },
    { to: "/inventory", label: "Inventory" },
    { to: "/pos", label: "Point of Sale" },
    { to: "/reconciliation", label: "Reconciliation" },
    { to: "/credit", label: "Credit" },
    { to: "/customer", label: "Customer" },
  ] as const;