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
 * Màn chờ chuyển khoản tự hỏi lại BE để đổi sang "Đã nhận thanh toán" khi webhook payOS báo tiền về.
 * 5s = 12 request/phút, dưới throttle 20 req/60s của route lookup (3s là chạm trần, khách F5 thêm
 * là dính 429). Chạy theo vòng đời mã QR (15 phút/mã, tạo mã mới là chạy lại) thay vì trần giờ
 * riêng: tab bỏ quên không gọi mãi, còn khách trả lúc phút 14 vẫn thấy trang tự đổi.
 */
export const BANK_TRANSFER_POLLING = {
  intervalMs: 5_000,
  // Khách quét đúng lúc mã sắp hết hạn: webhook payOS về sau khi FE đã đổi "expired" vài giây —
  // poll thêm 3 nhịp nữa rồi mới nghỉ, không thì trang kẹt ở "Tạo mã QR mới" dù tiền đã về
  expiredGraceMs: 15_000,
} as const;

/** payOS chỉ trả mã BIN — tên ngân hàng tra ở đây; BIN lạ thì ẩn dòng "Ngân hàng", STK vẫn đủ để chuyển */
export const BANK_NAME_BY_BIN: Record<string, string> = {
  "970422": "MB Bank",
  "970448": "OCB",
  "970452": "KienlongBank",
  "970416": "ACB",
  "970418": "BIDV",
  "970415": "VietinBank",
  "970436": "Vietcombank",
  "970407": "Techcombank",
};

export const DELIVERY_ESTIMATE_DAYS = { min: 3, max: 5 } as const;
