/**
 * Contract refund — đối chiếu: backend/src/modules/refund-policy/refund-policy.service.ts,
 * order/order.interface.ts (CheckoutRefundTerms), order/dto/make-order.dto.ts (ExpectedRefundTerms)
 */

/** BE: RefundPolicy — GET /refund-policy */
export interface RefundPolicy {
  enabled: boolean;
  /** Số ngày tính từ lúc giao hàng, nguyên 1–365 */
  windowDays: number;
  revision: number;
}

/**
 * BE: CheckoutRefundTerms (trong ICheckoutReview.refundTerms) = ExpectedRefundTerms
 * (MakeOrderDto.expectedRefundTerms) — khách đã xem điều khoản nào thì gửi đúng điều khoản đó.
 */
export interface RefundTerms {
  policyRevision: number;
  products: { productId: string; refundEnabled: boolean }[];
}

/** Trạng thái tải chính sách hiện hành — không bao giờ suy ra "có hỗ trợ" khi chưa tải được */
export type RefundPolicyState =
  | { status: "loading" }
  | { status: "ready"; policy: RefundPolicy }
  | { status: "unavailable" };

/** BE: RefundSnapshot['policy'] — điều khoản đã lưu theo đơn (OrderResponse.refundPolicy) */
export type OrderRefundPolicy = Pick<RefundPolicy, "enabled" | "windowDays">;

/**
 * Contract khách — đối chiếu: backend/src/modules/refund/refund.interface.ts
 * (RefundOrderView, CustomerRefundRequest, RefundSelection) và refund.mapper.ts (toCustomerRefundView).
 * Chỉ phần customer-safe: không ghi chú nội bộ, người duyệt, tham chiếu ngân hàng, key lệnh.
 */
export type RefundStage =
  | "awaiting_review"
  | "awaiting_return"
  | "awaiting_payout"
  | "payout_in_progress"
  | "refunded"
  | "rejected";

export type RefundCoverage = "none" | "partial" | "full";
export interface CustomerOrderRefundStatus {
  coverage: RefundCoverage;
  activeStages: RefundStage[];
  hasRejected: boolean;
}
export type RefundReason =
  "ordinary" | "missing_item" | "incorrect_item" | "other";
export type RefundRequestedReturn = "return" | "no_return";

export interface RefundSummary {
  activeStages: RefundStage[];
  paidAmount: number;
  paidShippingAmount: number;
  coverage: RefundCoverage;
  requestCount: number;
  reviewRequired: boolean;
}

/** Một dòng mua gốc (allocation) kèm số còn hoàn được — định danh gốc, KHÔNG gộp theo biến thể */
export interface RefundOrderAllocationView {
  allocationId: string;
  productInfoIndex: number;
  productName: string;
  variantLabel: string | null;
  purchasedQuantity: number;
  availableQuantity: number;
  requestedQuantity: number;
  refundedQuantity: number;
  netAmount: number;
  availableAmount: number;
  requestedAmount: number;
  refundedAmount: number;
  productRefundEnabled: boolean;
}

export interface CustomerRefundRequestItem {
  allocationId: string;
  productInfoIndex: number;
  quantity: number;
  reason: RefundReason;
  explanation: string;
  requestedReturn: RefundRequestedReturn;
  evidenceIds: string[];
  approvedQuantity: number;
  approvedAmount: number;
  returnRequired: boolean;
  receivedQuantity: number;
}

export interface CustomerRefundRequestHistoryEntry {
  event: string;
  at: string;
  customerMessage: string | null;
}

export interface CustomerRefundRequest {
  requestId: string;
  stage: RefundStage;
  submittedAt: string;
  items: CustomerRefundRequestItem[];
  shipping: { reservedAmount: number; approvedAmount: number };
  history: CustomerRefundRequestHistoryEntry[];
  payout: { amount: number; paidAt: string } | null;
}

export interface RefundOrderView {
  orderId: string;
  orderNumber: string;
  revision: number;
  policy: OrderRefundPolicy | null;
  /** ISO; null khi chưa có mốc giao đáng tin cậy */
  deadline: string | null;
  eligibility: {
    eligible: boolean;
    reviewRequired: boolean;
    reason: string | null;
  };
  allocations: RefundOrderAllocationView[];
  remainingPaidShipping: number;
  summary: RefundSummary;
  requests: CustomerRefundRequest[];
}

/** BE: RefundSelection (SubmitRefundInput.items) — mỗi dòng mang lý do/giải thích/ảnh riêng */
export interface RefundSelection {
  allocationId: string;
  quantity: number;
  reason: RefundReason;
  explanation: string;
  requestedReturn: RefundRequestedReturn;
  evidenceIds: string[];
}

export interface SubmitRefundInput {
  /** UUID, giữ nguyên qua các lần gửi lại khi kết quả chưa rõ */
  idempotencyKey: string;
  items: RefundSelection[];
}

/** BE: POST /orders/:orderNumber/refund-access/verify → 200 (phiên khách 24h theo đơn) */
export interface RefundGuestSession {
  sessionToken: string;
  expiresAt: string;
}

/** BE: POST /orders/:orderNumber/refund-evidence → 201 */
export interface RefundEvidenceUpload {
  evidenceId: string;
  name: string;
  mimeType: string;
  size: number;
}
