import type { OrderPaymentMethod, PaymentMethod } from "@/constants/payment";
import type { ICheckoutReviewCombo, IOrderCombo } from "./Combo.type";
import type {
  CustomerOrderRefundStatus,
  OrderRefundPolicy,
  RefundTerms,
} from "./Refund.type";

/**
 * Contract order — đối chiếu: x-ecommerce-backend/src/modules/order/
 * (make-order.dto.ts, order.interface.ts, order.model.ts, guest-order-query.dto.ts)
 */

/** BE: OrderStatus (order.model.ts) — giá trị lowercase */
export type OrderApiStatus =
  "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

/** BE: OrderActor + StatusHistoryEntry (order.model.ts) — timeline trạng thái đơn */
export interface IStatusHistoryEntry {
  status: OrderApiStatus;
  changedAt: string;
  changedBy: {
    actorType: "customer" | "admin" | "system" | "webhook";
    actorId?: string;
    actorName?: string;
  };
  note?: string;
}

/** BE: CancellationReason (order.model.ts) — lý do khách chọn khi tự hủy đơn */
export type CancellationReasonApi =
  | "changed_mind"
  | "wrong_order"
  | "better_price"
  | "slow_shipping"
  | "payment_issue"
  | "other";

/** BE: CancellationInfo (order.model.ts) — chỉ có trên đơn khách TỰ hủy */
export interface ICancellationInfo {
  reason: CancellationReasonApi;
  /** Có khi reason = other — mô tả khách tự viết */
  note?: string;
}

/** BE: PaymentStatus (order.model.ts) */
export type PaymentApiStatus =
  "unpaid" | "paid" | "refunded" | "failed" | "not_required";

/**
 * BE: PaymentHistoryEntry (order.model.ts) — dấu vết đổi paymentStatus. Route khách đã lọc
 * bỏ `note`/`reference`/`actorName`; route public còn không có `changedBy`.
 */
export interface IPaymentHistoryEntry {
  status: PaymentApiStatus;
  changedAt: string;
  changedBy?: { actorType: "admin" | "system" | "webhook" };
}

/** BE: PaymentLinkResponse (payment.interface.ts) — một mã QR payOS của đơn chuyển khoản */
export interface IPaymentLink {
  /** Chuỗi EMVCo (VietQR), KHÔNG phải URL ảnh — FE tự vẽ QR */
  qrCode: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  /** Nội dung chuyển khoản payOS cấp cho link này — khách chuyển tay phải gõ đúng */
  description: string;
  /** ISO — hạn của MÃ QR (15 phút), khác paymentDueAt của đơn (mặc định 1h) */
  expiresAt: string;
  /** Số giây còn lại theo đồng hồ server tại lúc trả response — hẹn giờ hết hạn theo đây, không so expiresAt với đồng hồ máy khách (lệch giờ là QR tự hết hạn oan) */
  expiresInSeconds: number;
}

/** BE: ShippingInfo trong MakeOrderDto — LƯU Ý tên field: name (không phải fullName), city (không phải province), specificAddress (không phải address), email BẮT BUỘC */
export interface IShippingInfoPayload {
  userAddressId?: string;
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  district?: string;
  ward: string;
  specificAddress: string;
  note?: string;
}

/** BE: PaymentInfo trong MakeOrderDto — method dùng enum BE, xem constants/payment.ts */
export interface IPaymentInfoPayload {
  method?: PaymentMethod;
  provider?: string;
  transactionId?: string;
  brand?: string;
  last4?: string;
}

/** BE: MakeOrderDto — body của POST /orders */
export interface IMakeOrderPayload {
  cartId: string;
  couponCode?: string;
  expectedTotalPrice?: number;
  expectedCartItems?: { variantId: string; quantity: number }[];
  expectedComboItems?: {
    comboId: string;
    quantity: number;
    picks: { productId: string; variantId: string }[];
  }[];
  shippingInfo: IShippingInfoPayload;
  paymentInfo?: IPaymentInfoPayload;
  /** Điều khoản hoàn tiền khách đã xem ở checkout review — BE trả 409 CHECKOUT_CHANGED nếu đã đổi */
  expectedRefundTerms?: RefundTerms;
  customerNote?: string;
}

/** BE: CancelOrderDto — body PATCH /orders/:id/cancel */
export interface ICancelOrderPayload {
  reason: CancellationReasonApi;
  /** Bắt buộc khi reason = other */
  note?: string;
}

/** BE: ProductExistInfo (product.interface.ts) — item trong checkout review */
export interface ICheckoutReviewProduct {
  refundEnabled: boolean;
  price: number;
  originalPrice: number;
  quantity: number;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  images: string[];
  inventoryCount: number;
  discountPercentage: number;
  sku: string;
  variantImage: string;
}

/** BE: ICheckoutReview — response GET /orders/checkout-review/:cartId */
export interface ICheckoutReview {
  refundTerms: RefundTerms;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalPrice: number;
  products: ICheckoutReviewProduct[];
  combos: ICheckoutReviewCombo[];
  appliedCoupon?: AppliedCoupon;
}

/** BE: AppliedCoupon — public review projection, without rules or usage history. */
export interface AppliedCoupon {
  couponId: string;
  couponCode: string;
  couponName: string;
  couponDiscountType: "percentage" | "fixed_amount";
  couponDiscountValue: number;
  couponDiscountPercentage?: number;
}

/** BE: CheckoutInfo embedded trong Order */
export interface IOrderCheckoutInfo {
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  totalPrice: number;
  couponCode?: string;
  couponId?: string;
  couponName?: string;
  couponDiscountType?: "percentage" | "fixed_amount";
  couponDiscountValue?: number;
  couponDiscountPercentage?: number;
  currency?: string;
}

/** BE: ShippingInfo embedded trong Order (shape trả về, giống payload) */
export type IOrderShippingInfo = IShippingInfoPayload;

/** BE: PaymentInfo embedded trong Order — token đã bị strip ở toJSON */
export interface IOrderPaymentInfo {
  method?: OrderPaymentMethod;
  provider?: string;
  transactionId?: string;
  brand?: string;
  last4?: string;
}

/** BE: OrderProduct embedded — snapshot tại thời điểm đặt */
export interface IOrderProduct {
  comboGroupId?: string;
  productId: string;
  variantId: string;
  quantity: number;
  productNameAtOrder?: string;
  /** Đơn tạo trước khi BE snapshot slug sẽ KHÔNG có field này → render không-link */
  productSlugAtOrder?: string;
  variantSkuAtOrder?: string;
  variantImageAtOrder?: string;
  attributeValuesAtOrder?: { name: string; value: string }[];
  priceAtOrder: number;
  originalPriceAtOrder: number;
}

/** BE: OrderResponse = Omit<Order, 'userId'|'sessionId'|'__v'> — response POST /orders, GET /orders (item), GET /orders/lookup/:orderNumber */
export interface IOrderResponse {
  _id: string;
  checkoutInfo: IOrderCheckoutInfo;
  shippingInfo: IOrderShippingInfo;
  paymentInfo: IOrderPaymentInfo;
  productInfo: IOrderProduct[];
  combos?: IOrderCombo[];
  status: OrderApiStatus;
  /**
   * Mảng rỗng với đơn tạo trước khi có status flow. Route của chính chủ
   * (GET /orders, /orders/by-number) đã lọc bỏ `changedBy.actorName` + `note` — hai field
   * đó chỉ tồn tại phía admin, đừng render như thể luôn có.
   */
  statusHistory?: IStatusHistoryEntry[];
  /** Chỉ đơn khách TỰ hủy sau khi có flow chọn lý do; đơn hủy bởi admin/system không có */
  cancellation?: ICancellationInfo;
  paymentStatus: PaymentApiStatus;
  paymentHistory?: IPaymentHistoryEntry[];
  /** Có khi paymentStatus đã từng là paid */
  paidAt?: string;
  /** Điều khoản hoàn tiền đã lưu lúc đặt; đơn tạo trước tính năng hoàn tiền không có field này */
  refundPolicy?: OrderRefundPolicy;
  /** Owner list/detail only; absent from public lookup and older API responses. */
  refundStatus?: CustomerOrderRefundStatus;
  /** Chỉ đơn BANK_TRANSFER tạo sau khi có hạn thanh toán; đơn cũ không có → không đếm giờ */
  paymentDueAt?: string;
  orderNumber?: string;
  customerNote?: string;
  created_at: string;
  updated_at: string;
}

/** Query params GET /orders — BE: OrderFilterDto (query-param.dto.ts của order) */
export interface IOrderFilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: OrderApiStatus;
  paymentStatus?: PaymentApiStatus;
}
