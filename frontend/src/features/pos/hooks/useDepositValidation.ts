// frontend/src/features/pos/hooks/useDepositValidation.ts

import { useMemo } from "react";
import { moneyAdd } from "../../../utils/money";
import type { DepositAllocationInput } from "../types";

/**
 * Ensures deposit allocations sum exactly to the Gate Pass total
 * (matches backend deposit.service.js moneyEquals check).
 */
export function useDepositValidation(
  allocations: DepositAllocationInput[],
  expectedTotal: string | number
) {
  return useMemo(() => {
    const totalAllocated = allocations.reduce(
      (sum, row) => moneyAdd(sum, row.amount || 0),
      "0.00"
    );

    const expected = Number(expectedTotal || 0).toFixed(2);
    const allocated = Number(totalAllocated).toFixed(2);
    const isValid = allocated === expected && Number(allocated) > 0;
    const difference = (Number(expected) - Number(allocated)).toFixed(2);

    return {
      totalAllocated,
      expected: expected,
      isValid,
      difference,
      hasAllocations: allocations.length > 0,
    };
  }, [allocations, expectedTotal]);
}