/**
 * Nhãn hiển thị theo OrderStatus BE (order.model.ts — giá trị lowercase).
 * pending = chờ xác nhận (KHÔNG phải chờ thanh toán), confirmed = đã xác nhận (chưa giao).
 * KHÔNG đặt class Tailwind ở đây — constants/ nằm ngoài vùng content scan nên class
 * sẽ không được generate (mất style im lặng); map màu sống tại OrderStatusPill (vùng scan).
 */
export const statusStyles = {
  pending: { label: "Chờ xác nhận" },
  confirmed: { label: "Đã xác nhận" },
  shipped: { label: "Đang giao hàng" },
  delivered: { label: "Đã giao hàng" },
  cancelled: { label: "Đã hủy" },
  returned: { label: "Đã hoàn trả" },
} as const;

export type OrderStatus = keyof typeof statusStyles;

/**
 * Tiến trình một đơn đi trót lọt — khung cố định của stepper trên trang chi tiết.
 * Đơn hủy/hoàn trả không đi theo khung này (rẽ nhánh giữa chừng): stepper dừng ở
 * mốc cuối cùng đạt được rồi gắn thêm mốc kết thúc lấy từ statusHistory.
 */
export const ORDER_PROGRESS_STEPS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
] as const;

/**
 * Nhãn dùng trên timeline — khác nhãn trạng thái ở chỗ nó gọi tên SỰ KIỆN đã xảy ra
 * ("Đặt hàng") thay vì tình trạng đơn đang đứng ("Chờ xác nhận").
 */
export const statusStepLabel: Record<OrderStatus, string> = {
  pending: "Đặt hàng",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
  returned: "Đã hoàn trả",
};

/** Tab lọc trên danh sách đơn — `undefined` = không gửi param status (tab Tất cả). */
export const ORDER_TABS: {
  key: string;
  label: string;
  status?: OrderStatus;
}[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận", status: "pending" },
  { key: "confirmed", label: "Đã xác nhận", status: "confirmed" },
  { key: "shipped", label: "Đang giao hàng", status: "shipped" },
  { key: "delivered", label: "Đã giao hàng", status: "delivered" },
  { key: "cancelled", label: "Đã hủy", status: "cancelled" },
];

export const ORDER_PAGE_SIZE = 10;
