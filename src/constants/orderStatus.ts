/**
 * Nhãn hiển thị theo OrderStatus BE (order.model.ts — giá trị lowercase).
 * pending = chờ xác nhận (KHÔNG phải chờ thanh toán), confirmed = đã xác nhận (chưa giao).
 */
export const statusStyles = {
  pending: { color: "text-blue-400", label: "Chờ xác nhận" },
  confirmed: { color: "text-primary-600", label: "Đã xác nhận" },
  shipped: { color: "text-yellow", label: "Đang giao hàng" },
  delivered: { color: "text-green", label: "Đã giao hàng" },
  cancelled: { color: "text-red-500", label: "Đơn hàng đã hủy" },
  returned: { color: "text-red-400", label: "Đã hoàn trả" },
} as const;

export type OrderStatus = keyof typeof statusStyles;
