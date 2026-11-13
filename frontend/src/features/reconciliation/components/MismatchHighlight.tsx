// frontend/src/features/reconciliation/components/MismatchHighlight.tsx

import { StatusBadge } from "../../../components/shared/StatusBadge";

interface Props {
  status: string;
  label?: string;
}

export function MismatchHighlight({ status, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-slate-600">{label}</span>}
      <StatusBadge status={status} />
    </div>
  );
}