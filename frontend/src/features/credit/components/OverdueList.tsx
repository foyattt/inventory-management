// frontend/src/features/credit/components/OverdueList.tsx

import { useEffect, useState } from "react";
import { getCreditOverview, type CreditLedgerRow } from "../api";
import { CreditOverview } from "./CreditOverview";
import { LoadingSpinner } from "../../../components/shared/LoadingSpinner";

export function OverdueList() {
  const [rows, setRows] = useState<CreditLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCreditOverview({ overdue: true, limit: 50 });
        setRows(res.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading overdue…" />;

  return <CreditOverview rows={rows} />;
}