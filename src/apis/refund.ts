import axiosRequest from "@/config/axios";
import type {
  RefundEvidenceUpload,
  RefundGuestSession,
  RefundOrderView,
  RefundPolicy,
  SubmitRefundInput,
} from "@/@types/Refund.type";

/**
 * Chính sách hoàn tiền hiện hành — route công khai, BE trả `Cache-Control: no-store`.
 * Notice tự hiện trạng thái lỗi → tắt toast global, tránh double display.
 */
export const getRefundPolicy = (
  signal?: AbortSignal
): Promise<{ data: RefundPolicy }> => {
  return axiosRequest.get("/refund-policy", { signal, toastError: false });
};

interface RefundRequestOptions {
  signal?: AbortSignal;
  /** Phiên khách đã xác thực — chỉ gửi qua header, không bao giờ vào URL. Khách đăng nhập không cần. */
  sessionToken?: string;
}

const orderPath = (orderNumber: string) =>
  `/orders/${encodeURIComponent(orderNumber)}`;

// Panel hiển thị lỗi inline (và tự điều phối 401/409) → tắt toast global
const refundRequestConfig = ({
  signal,
  sessionToken,
}: RefundRequestOptions) => ({
  signal,
  toastError: false as const,
  ...(sessionToken && { headers: { "X-Refund-Token": sessionToken } }),
});

export const getOrderRefunds = (
  orderNumber: string,
  options: RefundRequestOptions = {}
): Promise<{ data: RefundOrderView }> =>
  axiosRequest.get(
    `${orderPath(orderNumber)}/refunds`,
    refundRequestConfig(options)
  );

export const submitRefund = (
  orderNumber: string,
  input: SubmitRefundInput,
  options: Pick<RefundRequestOptions, "sessionToken"> = {}
): Promise<{ data: RefundOrderView }> =>
  axiosRequest.post(
    `${orderPath(orderNumber)}/refunds`,
    input,
    refundRequestConfig(options)
  );

/** Multipart field `image`; không tự đặt Content-Type để trình duyệt gắn boundary */
export const uploadRefundEvidence = (
  orderNumber: string,
  file: File,
  options: RefundRequestOptions = {}
): Promise<{ data: RefundEvidenceUpload }> => {
  const data = new FormData();
  data.append("image", file);
  return axiosRequest.post(
    `${orderPath(orderNumber)}/refund-evidence`,
    data,
    refundRequestConfig(options)
  );
};

/** Bytes riêng tư qua route xác thực (không có URL công khai) — caller tự tạo/thu hồi object URL */
export const getRefundEvidence = (
  orderNumber: string,
  evidenceId: string,
  options: RefundRequestOptions = {}
): Promise<Blob> =>
  axiosRequest.get(
    `${orderPath(orderNumber)}/refund-evidence/${encodeURIComponent(evidenceId)}`,
    { ...refundRequestConfig(options), responseType: "blob" }
  );

/**
 * Xin link xác thực gửi tới email đặt hàng của đơn khách. BE luôn 202 cùng một thân
 * (không lộ đơn nào đủ điều kiện) và không nhận email từ client.
 */
export const requestRefundAccess = (
  orderNumber: string
): Promise<{ data: { message: string } }> =>
  axiosRequest.post(
    `${orderPath(orderNumber)}/refund-access/request`,
    undefined,
    {
      toastError: false,
    }
  );

/** Đổi link một lần lấy phiên 24h theo đơn — token link chỉ đi trong body */
export const verifyRefundAccess = (
  orderNumber: string,
  token: string
): Promise<{ data: RefundGuestSession }> =>
  axiosRequest.post(
    `${orderPath(orderNumber)}/refund-access/verify`,
    { token },
    { toastError: false }
  );
