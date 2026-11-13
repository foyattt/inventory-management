// frontend/src/features/reconciliation/components/ComparisonTables.tsx

import type { ComparisonResult } from "../api";

interface Props {
  comparison: ComparisonResult | null;
}

export function ComparisonTables({ comparison }: Props) {
  if (!comparison) {
    return (
      <p className="text-sm text-slate-500">Select a transaction to compare.</p>
    );
  }

  const d = comparison.differences;

  return (
    <div className="space-y-6">
      <Section title="Quantity mismatches" rows={d.quantityMismatches} />
      <Section title="Price mismatches" rows={d.priceMismatches} />
      <Section title="Missing in invoice" rows={d.missingInInvoice} />
      <Section title="Missing in gate pass" rows={d.missingInGatePass} />
    </div>
  );
}

function Section({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
}) {
  if (!rows || rows.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-2">{title}</h3>
        <p className="text-xs text-slate-400">None</p>
      </div>
    );
  }

  const keys = Object.keys(rows[0]);

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-900 mb-2">{title}</h3>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {keys.map((k) => (
                <th key={k} className="text-left px-3 py-2 font-medium">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2">
                    {String(row[k] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}