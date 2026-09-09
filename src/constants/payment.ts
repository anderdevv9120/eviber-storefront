/**
 * Payment method — GIÁ TRỊ PHẢI KHỚP BE enum trong make-order.dto.ts (PaymentInfo.method).
 * FE cũ dùng "cod"/"bank"/"card" là SAI contract — dùng map này, không hardcode.
 */
export const PAYMENT_METHODS = [
  { value: "CASH", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "CARD", label: "Thẻ tín dụng / ghi nợ" },
  { value: "E_WALLET", label: "Ví điện tử" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

/**
 * Bộ phương thức hiện trên UI checkout (chốt phase 3): COD mặc định + chuyển khoản.
 * CARD/E_WALLET vẫn hợp lệ với BE nhưng chưa có cổng thật nên không cho chọn.
 */
export const CHECKOUT_PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "CASH",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt cho shipper khi nhận hàng.",
  },
  {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    description: "Đơn được xác nhận khi tiền về tài khoản.",
  },
];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "CASH";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> =
  Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label])) as Record<
    PaymentMethod,
    string
  >;
export const BANK_TRANSFER_ACCOUNT = {
  bankBin: "970436",
  bankName: "Vietcombank",
  accountNumber: "0071000123456",
  accountName: "CONG TY TNHH X-ECOMMERCE",
} as const;

export const DELIVERY_ESTIMATE_DAYS = { min: 3, max: 5 } as const;
