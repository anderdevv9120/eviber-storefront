import axiosRequest from "@/config/axios";
import type { RefundPolicy } from "@/@types/Refund.type";

/**
 * Chính sách hoàn tiền hiện hành — route công khai, BE trả `Cache-Control: no-store`.
 * Notice tự hiện trạng thái lỗi → tắt toast global, tránh double display.
 */
export const getRefundPolicy = (
  signal?: AbortSignal
): Promise<{ data: RefundPolicy }> => {
  return axiosRequest.get("/refund-policy", { signal, toastError: false });
};
