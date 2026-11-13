// frontend/src/features/pos/types.ts

export type PaymentMethod = "CASH" | "CREDIT";

export type AccountName = "Zesino" | "Aleme" | "alem" | "Yirzemu";

export type BankName =
  | "Awash"
  | "Abyssinia"
  | "CBE"
  | "Oromia_Cooperative_Bank"
  | "Dashen"
  | "Hibret"
  | "Zemen";

export interface PosLineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  stockSourceId?: string | null;
}

export interface DepositAllocationInput {
  accountName: AccountName;
  bankName: BankName;
  amount: number;
}

export interface CreateTransactionPayload {
  gatePassNo: string;
  fsNo: string;
  customerId: string;
  paymentMethod: PaymentMethod;
  gatePassItems: PosLineItem[];
  invoiceItems?: PosLineItem[];
  depositAllocations?: DepositAllocationInput[];
  notes?: string | null;
}

export interface PosProduct {
  id: string;
  code: string;
  name: string;
  available: number;
  price: number;
  quantity: number;
}

export interface CustomerOption {
  id: string;
  name: string;
  tinNo?: string | null;
  phone?: string | null;
  creditLimit?: string | number;
  creditPeriodDays?: number;
}

export interface TransactionSummary {
  id: string;
  gatePassNo: string;
  fsNo: string;
  paymentMethod: PaymentMethod;
  gatePassTotal: string;
  invoiceTotal: string;
  customer: { id: string; name: string };
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ACCOUNT_NAMES: AccountName[] = [
  "Zesino",
  "Aleme",
  "alem",
  "Yirzemu",
];

export const BANK_NAMES: BankName[] = [
  "Awash",
  "Abyssinia",
  "CBE",
  "Oromia_Cooperative_Bank",
  "Dashen",
  "Hibret",
  "Zemen",
];