// frontend/src/features/pos/components/TotalsPanel.tsx

import { formatMoney } from "../../../api/client";

interface Props {
  subtotal: string;
  taxAmount: string;
  total: string;
  taxRatePercent?: number;
  label: string;
}

export function TotalsPanel({
  subtotal,
  taxAmount,
  total,
  taxRatePercent = 15,
  label,
}: Props) {
  return (
    <div className="px-5 py-3 border-t border-slate-100 grid grid-cols-4 gap-4 text-sm">
      <div>
        <p className="text-slate-500">Subtotal before tax</p>
        <p className="font-medium">{formatMoney(subtotal)}</p>
      </div>
      <div>
        <p className="text-slate-500">Tax rate</p>
        <p className="font-medium">{taxRatePercent}%</p>
      </div>
      <div>
        <p className="text-slate-500">Tax amount</p>
        <p className="font-medium">{formatMoney(taxAmount)}</p>
      </div>
      <div className="text-right">
        <p className="text-slate-500">{label}</p>
        <p className="font-semibold text-blue-600">{formatMoney(total)}</p>
      </div>
    </div>
  );
}