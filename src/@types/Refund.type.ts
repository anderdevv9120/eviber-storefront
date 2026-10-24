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
