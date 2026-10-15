import type { OrderPaymentMethod, PaymentMethod } from "@/constants/payment";

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
  shippingInfo: IShippingInfoPayload;
  paymentInfo?: IPaymentInfoPayload;
  customerNote?: string;
}

/** BE: ProductExistInfo (product.interface.ts) — item trong checkout review */
export interface ICheckoutReviewProduct {
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
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalPrice: number;
  products: ICheckoutReviewProduct[];
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
  status: OrderApiStatus;
  /**
   * Mảng rỗng với đơn tạo trước khi có status flow. Route của chính chủ
   * (GET /orders, /orders/by-number) đã lọc bỏ `changedBy.actorName` + `note` — hai field
   * đó chỉ tồn tại phía admin, đừng render như thể luôn có.
   */
  statusHistory?: IStatusHistoryEntry[];
  paymentStatus: PaymentApiStatus;
  paymentHistory?: IPaymentHistoryEntry[];
  /** Có khi paymentStatus đã từng là paid */
  paidAt?: string;
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
