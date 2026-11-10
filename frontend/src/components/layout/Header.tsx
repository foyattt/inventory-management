// frontend/src/components/layout/Header.tsx

import { Bell, Calendar } from "lucide-react";

interface Props {
  title?: string;
  breadcrumb?: string;
}

export function Header({
  title = "Point of Sale",
  breadcrumb = "ZeSino",
}: Props) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-slate-500">
        {breadcrumb} <span className="mx-1">/</span>{" "}
        <span className="text-slate-900 font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar size={16} />
          <span>{today}</span>
        </div>
      </div>
    </header>
  );
}