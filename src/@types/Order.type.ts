import type { PaymentMethod } from "@/constants/payment";

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
export type PaymentApiStatus = "unpaid" | "paid" | "refunded" | "failed";

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
}

/** BE: CheckoutInfo embedded trong Order */
export interface IOrderCheckoutInfo {
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  totalPrice: number;
  couponCode?: string;
  couponDiscountPercentage?: number;
  currency?: string;
}

/** BE: ShippingInfo embedded trong Order (shape trả về, giống payload) */
export type IOrderShippingInfo = IShippingInfoPayload;

/** BE: PaymentInfo embedded trong Order — token đã bị strip ở toJSON */
export interface IOrderPaymentInfo {
  method?: string;
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
  /** Mảng rỗng với đơn tạo trước khi có status flow */
  statusHistory?: IStatusHistoryEntry[];
  paymentStatus: PaymentApiStatus;
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
