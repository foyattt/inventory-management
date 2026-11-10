// frontend/src/features/pos/hooks/useStockCheck.ts

import { useMemo } from "react";
import type { PosProduct } from "../types";

/**
 * Flags Gate Pass lines that exceed available stock.
 * Backend will also reject insufficient stock during create.
 */
export function useStockCheck(gatePassItems: PosProduct[]) {
  return useMemo(() => {
    const oversold = gatePassItems.filter(
      (item) => item.quantity > 0 && item.quantity > item.available
    );

    return {
      isValid: oversold.length === 0,
      oversold,
      messages: oversold.map(
        (item) =>
          `${item.code || item.name}: requested ${item.quantity}, available ${item.available}`
      ),
    };
  }, [gatePassItems]);
}