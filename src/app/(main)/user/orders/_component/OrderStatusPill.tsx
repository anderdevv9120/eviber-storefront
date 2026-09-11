import { cn } from "@/config/utils";
import { OrderStatus, statusStyles } from "@/constants/orderStatus";

// Map màu đặt tại đây (vùng Tailwind content scan) — để trong constants/ là class
// không được generate, mất màu im lặng (đã cắn với text-yellow/text-red-500).
// Pill nằm TRÊN gáy card cùng sắc (STATUS_HEADER) nên cần viền mảnh mới tách ra được —
// đổi nền đậm hơn thì mảng màu lấn hết card
const PILL: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-500/30",
  confirmed:
    "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-500/30",
  shipped: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-400/30",
  delivered: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-700/25",
  cancelled: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-800/25",
  returned: "bg-white-100 text-dark-500 ring-1 ring-inset ring-dark-200/60",
};

const DOT: Record<OrderStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-primary-500",
  shipped: "bg-blue-400",
  delivered: "bg-green-700",
  cancelled: "bg-red-800",
  returned: "bg-dark-400",
};

/** Nền gáy card đơn — cùng sắc với pill nhưng nhạt hơn một bậc để pill vẫn nổi lên trên */
export const STATUS_HEADER: Record<OrderStatus, string> = {
  pending: "bg-yellow-50",
  confirmed: "bg-primary-50",
  shipped: "bg-blue-50",
  delivered: "bg-green-50",
  cancelled: "bg-red-50",
  returned: "bg-white-50",
};

export const isKnownStatus = (status: string): status is OrderStatus =>
  status in statusStyles;

const OrderStatusPill = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  if (!isKnownStatus(status)) {
    return (
      <span
        className={cn(
          "inline-flex h-[26px] items-center rounded-full bg-white-100 px-3 text-xs font-bold text-dark-500",
          className
        )}
      >
        Trạng thái không xác định
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-2 rounded-full px-3 text-xs font-bold",
        PILL[status],
        className
      )}
    >
      <i className={cn("h-[7px] w-[7px] rounded-full", DOT[status])} />
      {statusStyles[status].label}
    </span>
  );
};

export default OrderStatusPill;
