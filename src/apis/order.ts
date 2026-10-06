import axiosRequest from "@/config/axios";
import type { AxiosRequestConfig } from "axios";
import { IMakeOrderPayload, IOrderFilterParams } from "@/@types/Order.type";

export const getOrders = (
  params: IOrderFilterParams = {},
  signal?: AbortSignal
) => {
  // Danh sách có khối lỗi + nút Thử lại tại chỗ → tắt toast global, tránh double display
  return axiosRequest.get("/orders", { params, signal, toastError: false });
};

/** Review đơn trước khi đặt — BE validate tồn kho + tính subtotal/shipping/total */
export const getCheckoutSettings = (
  signal?: AbortSignal
): Promise<{ data: { allowGuestCheckout: boolean } }> => {
  return axiosRequest.get("/orders/checkout-settings", {
    signal,
    toastError: false,
  });
};

export const checkoutReview = (
  cartId: string,
  signal?: AbortSignal,
  options?: Pick<AxiosRequestConfig, "toastError">
) => {
  return axiosRequest.get(`/orders/checkout-review/${cartId}`, {
    signal,
    ...options,
  });
};

/** Tạo đơn thật — hoạt động cho cả user (JWT) lẫn guest (sessionId cookie) */
export const makeOrder = (
  payload: IMakeOrderPayload,
  options?: Pick<AxiosRequestConfig, "toastError">
) => {
  return axiosRequest.post("/orders", payload, options);
};

/**
 * Tra cứu đơn bằng mã đơn — mã 80 bit ngẫu nhiên nên tự nó là bằng chứng sở hữu,
 * KHÔNG cần email kèm theo.
 */
export const getOrderByNumber = (orderNumber: string) => {
  // Màn success đã render lỗi tại chỗ (không tìm thấy đơn / bị giới hạn tần suất)
  // → tắt toast global, tránh double display
  return axiosRequest.get(`/orders/lookup/${encodeURIComponent(orderNumber)}`, {
    toastError: false,
  });
};

/**
 * Chi tiết một đơn của chính user đang đăng nhập — khác `getOrderByNumber` (route
 * tra cứu công khai) ở chỗ BE kiểm tra quyền sở hữu và trả kèm lịch sử trạng thái.
 */
export const getMyOrderDetail = (orderNumber: string, signal?: AbortSignal) => {
  // Trang chi tiết render lỗi tại chỗ (không tìm thấy / không phải đơn của mình)
  return axiosRequest.get(
    `/orders/by-number/${encodeURIComponent(orderNumber)}`,
    { toastError: false, signal }
  );
};

/** Khách hủy đơn PENDING của mình — BE hoàn kho trong cùng transaction */
export const cancelOrder = (orderId: string) => {
  return axiosRequest.patch(`/orders/${orderId}/cancel`);
};

const orderAPI = {
  getOrders,
  getOrderByNumber,
  getMyOrderDetail,
  checkoutReview,
  getCheckoutSettings,
  makeOrder,
  cancelOrder,
};

export default orderAPI;
