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

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> =
  Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label])) as Record<
    PaymentMethod,
    string
  >;
