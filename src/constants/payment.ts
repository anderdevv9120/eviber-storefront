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
/** Nhãn PaymentStatus BE (order.model.ts) */
export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
  failed: "Thanh toán thất bại",
};

/**
 * Màn chờ chuyển khoản tự hỏi lại BE để đổi sang "Đã nhận thanh toán" khi admin duyệt.
 * 15s × 10 phút = 40 request, dưới throttle 20 req/60s của route lookup; quá 10 phút dừng hẳn
 * (khách còn email + mở lại link).
 */
export const BANK_TRANSFER_POLLING = {
  intervalMs: 15_000,
  durationMs: 10 * 60 * 1000,
} as const;

export const DELIVERY_ESTIMATE_DAYS = { min: 3, max: 5 } as const;
