// frontend/src/features/pos/hooks/usePosForm.ts

import { useCallback, useMemo, useState } from "react";
import { moneyAdd, moneyMul, moneyTax } from "../../../utils/money";
import type {
  AccountName,
  BankName,
  CreateTransactionPayload,
  CustomerOption,
  DepositAllocationInput,
  PaymentMethod,
  PosProduct,
} from "../types";

export interface PosFormState {
  gatePassNo: string;
  fsNo: string;
  customer: CustomerOption | null;
  paymentMethod: PaymentMethod | "";
  gatePassItems: PosProduct[];
  invoiceItems: PosProduct[];
  depositAllocations: DepositAllocationInput[];
  notes: string;
}

const initialState: PosFormState = {
  gatePassNo: "",
  fsNo: "",
  customer: null,
  paymentMethod: "",
  gatePassItems: [],
  invoiceItems: [],
  depositAllocations: [],
  notes: "",
};

export function usePosForm(initialProducts: PosProduct[] = []) {
  const [form, setForm] = useState<PosFormState>({
    ...initialState,
    gatePassItems: initialProducts.map((p) => ({ ...p, quantity: 0 })),
    invoiceItems: initialProducts.map((p) => ({ ...p, quantity: 0 })),
  });

  const setProducts = useCallback((products: PosProduct[]) => {
    setForm((prev) => ({
      ...prev,
      gatePassItems: products.map((p) => {
        const existing = prev.gatePassItems.find((x) => x.id === p.id);
        return { ...p, quantity: existing?.quantity ?? 0 };
      }),
      invoiceItems: products.map((p) => {
        const existing = prev.invoiceItems.find((x) => x.id === p.id);
        return { ...p, quantity: existing?.quantity ?? 0 };
      }),
    }));
  }, []);

  const updateQuantity = useCallback(
    (list: "gate" | "invoice", id: string, delta: number) => {
      setForm((prev) => {
        const key = list === "gate" ? "gatePassItems" : "invoiceItems";
        return {
          ...prev,
          [key]: prev[key].map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(0, item.quantity + delta) }
              : item
          ),
        };
      });
    },
    []
  );

  const setQuantity = useCallback(
    (list: "gate" | "invoice", id: string, quantity: number) => {
      setForm((prev) => {
        const key = list === "gate" ? "gatePassItems" : "invoiceItems";
        return {
          ...prev,
          [key]: prev[key].map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ),
        };
      });
    },
    []
  );

  const setField = useCallback(
    <K extends keyof PosFormState>(key: K, value: PosFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addDeposit = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      depositAllocations: [
        ...prev.depositAllocations,
        {
          accountName: "Zesino" as AccountName,
          bankName: "CBE" as BankName,
          amount: 0,
        },
      ],
    }));
  }, []);

  const updateDeposit = useCallback(
    (index: number, patch: Partial<DepositAllocationInput>) => {
      setForm((prev) => ({
        ...prev,
        depositAllocations: prev.depositAllocations.map((row, i) =>
          i === index ? { ...row, ...patch } : row
        ),
      }));
    },
    []
  );

  const removeDeposit = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      depositAllocations: prev.depositAllocations.filter((_, i) => i !== index),
    }));
  }, []);

  const clear = useCallback(() => {
    setForm((prev) => ({
      ...initialState,
      gatePassItems: prev.gatePassItems.map((p) => ({ ...p, quantity: 0 })),
      invoiceItems: prev.invoiceItems.map((p) => ({ ...p, quantity: 0 })),
    }));
  }, []);

  const totals = useMemo(() => {
    const calc = (items: PosProduct[]) =>
      items.reduce(
        (sum, item) => moneyAdd(sum, moneyMul(item.quantity, item.price)),
        "0.00"
      );

    const gateSubtotal = calc(form.gatePassItems);
    const invoiceSubtotal = calc(form.invoiceItems);
    const gateTax = moneyTax(gateSubtotal);
    const invoiceTax = moneyTax(invoiceSubtotal);
    const gateTotal = moneyAdd(gateSubtotal, gateTax);
    const invoiceTotal = moneyAdd(invoiceSubtotal, invoiceTax);

    return {
      gateSubtotal,
      gateTax,
      gateTotal,
      invoiceSubtotal,
      invoiceTax,
      invoiceTotal,
      taxRatePercent: 15,
    };
  }, [form.gatePassItems, form.invoiceItems]);

  const toPayload = useCallback((): CreateTransactionPayload | null => {
    if (
      !form.gatePassNo.trim() ||
      !form.fsNo.trim() ||
      !form.customer ||
      !form.paymentMethod
    ) {
      return null;
    }

    const gatePassItems = form.gatePassItems
      .filter((i) => i.quantity > 0)
      .map((i) => ({
        productId: i.id,
        quantity: i.quantity,
        unitPrice: i.price,
      }));

    if (gatePassItems.length === 0) return null;

    const invoiceItems = form.invoiceItems
      .filter((i) => i.quantity > 0)
      .map((i) => ({
        productId: i.id,
        quantity: i.quantity,
        unitPrice: i.price,
      }));

    const payload: CreateTransactionPayload = {
      gatePassNo: form.gatePassNo.trim(),
      fsNo: form.fsNo.trim(),
      customerId: form.customer.id,
      paymentMethod: form.paymentMethod,
      gatePassItems,
      invoiceItems,
      notes: form.notes || null,
    };

    if (form.paymentMethod === "CASH") {
      payload.depositAllocations = form.depositAllocations.filter(
        (d) => d.amount > 0
      );
    }

    return payload;
  }, [form]);

  return {
    form,
    setField,
    setProducts,
    updateQuantity,
    setQuantity,
    addDeposit,
    updateDeposit,
    removeDeposit,
    clear,
    totals,
    toPayload,
  };
}