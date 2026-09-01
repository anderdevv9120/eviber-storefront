/**
 * Nhãn hiển thị theo OrderStatus BE (order.model.ts — giá trị lowercase).
 * pending = chờ xác nhận (KHÔNG phải chờ thanh toán), confirmed = đã xác nhận (chưa giao).
 * KHÔNG đặt class Tailwind ở đây — constants/ nằm ngoài vùng content scan nên class
 * sẽ không được generate (mất style im lặng); map màu sống tại OrderItem (vùng scan).
 */
export const statusStyles = {
  pending: { label: "Chờ xác nhận" },
  confirmed: { label: "Đã xác nhận" },
  shipped: { label: "Đang giao hàng" },
  delivered: { label: "Đã giao hàng" },
  cancelled: { label: "Đơn hàng đã hủy" },
  returned: { label: "Đã hoàn trả" },
} as const;

export type OrderStatus = keyof typeof statusStyles;
