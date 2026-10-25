import axiosRequest from "@/config/axios";

/**
 * Mã QR payOS của đơn chuyển khoản đang chờ trả. POST vì có thể TẠO link mới: BE trả link còn
 * hạn nếu có, hết hạn thì tạo link khác (hạn do shop đặt trên CMS, 5–30 phút) — gọi lại chính hàm này để "Tạo mã QR mới".
 * Không gửi body; số tiền BE lấy từ đơn. 400 = đơn không còn chờ thanh toán, 503 = payOS lỗi;
 * 503 kèm mã `BANK_TRANSFER_UNAVAILABLE_CODE` = shop chưa cấu hình payOS trên CMS.
 */
export const getPaymentLink = (orderNumber: string) => {
  // Khối chuyển khoản tự render lỗi tại chỗ kèm nút thử lại
  return axiosRequest.post(
    `/payments/orders/${encodeURIComponent(orderNumber)}/link`,
    undefined,
    { toastError: false }
  );
};

const paymentAPI = { getPaymentLink };

export default paymentAPI;
