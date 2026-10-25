import {
  CHECKOUT_PAYMENT_METHODS,
  DEFAULT_PAYMENT_METHOD,
  type PaymentMethod,
} from "@/constants/payment";

/**
 * Chuyển khoản chỉ hiện khi BE xác nhận shop đã cấu hình payOS. Chưa biết (đang tải / lỗi mạng) cũng
 * ẩn: hiện rồi khách chọn mà BE chưa sẵn sàng là đơn bị từ chối lúc bấm đặt.
 */
export function availablePaymentMethods(
  bankTransferAvailable: boolean | undefined
) {
  return CHECKOUT_PAYMENT_METHODS.filter(
    (method) =>
      method.value !== "BANK_TRANSFER" || bankTransferAvailable === true
  );
}

/**
 * Phương thức đang chọn không còn trong danh sách → về mặc định. Chỉ gọi khi đã biết trạng thái:
 * đang tải mà đổi ngay là lựa chọn của khách bị ghi đè trước khi kịp biết nó có hợp lệ không.
 */
export function keepAvailableMethod(
  current: unknown,
  methods: ReturnType<typeof availablePaymentMethods>
): PaymentMethod {
  const match = methods.find((method) => method.value === current);
  return match ? match.value : DEFAULT_PAYMENT_METHOD;
}
