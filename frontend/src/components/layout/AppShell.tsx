// frontend/src/components/layout/AppShell.tsx

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface Props {
  children: ReactNode;
  title?: string;
  breadcrumb?: string;
  /** When true, omit the default Header (useful for pages that render their own) */
  hideHeader?: boolean;
}

export function AppShell({
  children,
  title,
  breadcrumb,
  hideHeader = false,
}: Props) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideHeader && <Header title={title} breadcrumb={breadcrumb} />}
        {children}
      </div>
    </div>
  );
}