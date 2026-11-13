// frontend/src/components/shared/AlertBanner.tsx

import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "error" | "success" | "warning" | "info";

interface Props {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const styles: Record<Variant, string> = {
  error: "bg-red-50 border-red-200 text-red-700",
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

export function AlertBanner({
  variant = "info",
  children,
  className,
  onDismiss,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm flex items-start justify-between gap-3",
        styles[variant],
        className
      )}
    >
      <div>{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100 text-xs font-medium"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}