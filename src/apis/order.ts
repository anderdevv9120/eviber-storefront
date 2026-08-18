import axiosRequest from "@/config/axios";
import { IMakeOrderPayload, IOrderFilterParams } from "@/@types/Order.type";

export const getOrders = (
  params: IOrderFilterParams = {},
  signal?: AbortSignal
) => {
  return axiosRequest.get("/orders", { params, signal });
};

/** Review đơn trước khi đặt — BE validate tồn kho + tính subtotal/shipping/total */
export const checkoutReview = (cartId: string, signal?: AbortSignal) => {
  return axiosRequest.get(`/orders/checkout-review/${cartId}`, { signal });
};

/** Tạo đơn thật — hoạt động cho cả user (JWT) lẫn guest (sessionId cookie) */
export const makeOrder = (payload: IMakeOrderPayload) => {
  return axiosRequest.post("/orders", payload);
};

/** Tra cứu đơn bằng orderNumber + email — dùng cho trang success (user lẫn guest) */
export const getGuestOrder = (orderNumber: string, email: string) => {
  return axiosRequest.get(`/orders/guest/${orderNumber}`, {
    params: { email },
  });
};

/** Khách hủy đơn PENDING của mình — BE hoàn kho trong cùng transaction */
export const cancelOrder = (orderId: string) => {
  return axiosRequest.patch(`/orders/${orderId}/cancel`);
};

const orderAPI = {
  getOrders,
  checkoutReview,
  makeOrder,
  getGuestOrder,
  cancelOrder,
};

export default orderAPI;
