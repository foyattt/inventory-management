// frontend/src/components/shared/LoadingSpinner.tsx

import { cn } from "../../lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

export function LoadingSpinner({ size = "md", className, label }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-slate-300 border-t-blue-600",
          sizeMap[size]
        )}
      />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );
}