"use client";

import { IOrderResponse } from "@/@types/Order.type";
import { cn } from "@/config/utils";
import {
  ORDER_PROGRESS_STEPS,
  OrderStatus,
  statusStepLabel,
} from "@/constants/orderStatus";
import { DELIVERY_ESTIMATE_DAYS } from "@/constants/payment";
import { formatDateTime, formatDeliveryEstimate } from "@/utils/formatTime";

type StepState = "done" | "current" | "upcoming";

interface TimelineStep {
  status: OrderStatus;
  state: StepState;
  time?: string;
}

const DOT: Record<StepState, string> = {
  done: "border-primary-200 bg-primary-200",
  current: "border-primary bg-primary ring-[5px] ring-primary-50",
  upcoming: "border-white-600 bg-white",
};

const LABEL: Record<StepState, string> = {
  done: "text-dark",
  current: "font-extrabold text-primary-700",
  upcoming: "text-dark-400",
};

const buildSteps = (order: IOrderResponse): TimelineStep[] => {
  const reachedAt = new Map<OrderStatus, string>();
  (order.statusHistory ?? []).forEach((entry) => {
    if (!reachedAt.has(entry.status))
      reachedAt.set(entry.status, entry.changedAt);
  });
  // Đơn đặt trước khi BE ghi statusHistory có mảng rỗng — mốc đầu vẫn dựng được từ
  // ngày tạo đơn, không để timeline trống trơn
  if (!reachedAt.has("pending")) reachedAt.set("pending", order.created_at);

  const currentIndex = ORDER_PROGRESS_STEPS.indexOf(
    order.status as (typeof ORDER_PROGRESS_STEPS)[number]
  );

  if (currentIndex >= 0) {
    return ORDER_PROGRESS_STEPS.map((status, index) => ({
      status,
      time: reachedAt.get(status),
      state:
        index < currentIndex
          ? "done"
          : index === currentIndex
            ? "current"
            : "upcoming",
    }));
  }

  // Hủy / hoàn trả là rẽ nhánh: giữ những mốc đã thật sự đi qua rồi đóng bằng mốc kết thúc
  const passed = ORDER_PROGRESS_STEPS.filter((status) =>
    reachedAt.has(status)
  ).map((status): TimelineStep => ({
    status,
    time: reachedAt.get(status),
    state: "done",
  }));

  return [
    ...passed,
    {
      status: order.status,
      // Đơn hủy/hoàn trả từ trước khi BE ghi statusHistory không có mốc riêng — lần cập
      // nhật cuối chính là lúc nó rẽ nhánh, đủ chính xác để hiển thị
      time: reachedAt.get(order.status) ?? order.updated_at,
      state: "current",
    },
  ];
};

/**
 * Mốc chưa tới để TRỐNG dòng thời gian — chấm rỗng + nhãn mờ đã nói nó chưa xảy ra.
 * Riêng "Đã giao hàng" đoán được nên đưa khoảng ước lượng dùng chung với màn đặt hàng thành công.
 */
const upcomingHint = (step: TimelineStep, order: IOrderResponse) => {
  if (step.status !== "delivered") return "";

  // Đơn đã quá hạn dự kiến thì im lặng còn hơn hiện một mốc nằm ở quá khứ
  const deadline = new Date(order.created_at);
  deadline.setDate(deadline.getDate() + DELIVERY_ESTIMATE_DAYS.max);
  if (deadline.getTime() < Date.now()) return "";

  return `Dự kiến ${formatDeliveryEstimate(
    order.created_at,
    DELIVERY_ESTIMATE_DAYS.min,
    DELIVERY_ESTIMATE_DAYS.max
  )}`;
};

/** Màu đoạn nối lấy theo mốc nó dẫn TỚI — đoạn dẫn vào mốc hủy/hoàn trả không tô primary */
const connectorColor = (
  target: TimelineStep | undefined,
  isTerminal: boolean
) => {
  if (!target || target.state === "upcoming") return "bg-white-500";
  return isTerminal && target.state === "current"
    ? "bg-red-100"
    : "bg-primary-200";
};

const OrderTimeline = ({ order }: { order: IOrderResponse }) => {
  const steps = buildSteps(order);
  const isTerminal =
    order.status === "cancelled" || order.status === "returned";

  return (
    <ol className="flex flex-col gap-6 md:flex-row md:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.status}
          className="relative flex gap-3 md:flex-1 md:flex-col md:items-center md:gap-0 md:pt-7 md:text-center"
        >
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute left-[7px] top-5 h-[calc(100%+8px)] w-0.5 md:hidden",
                connectorColor(steps[index + 1], isTerminal)
              )}
            />
          )}
          {index > 0 && (
            <span
              aria-hidden
              className={cn(
                "absolute right-1/2 top-[7px] hidden h-0.5 w-full md:block",
                connectorColor(steps[index], isTerminal)
              )}
            />
          )}

          <span
            aria-hidden
            className={cn(
              "z-[1] mt-1 h-4 w-4 flex-none rounded-full border-2 md:absolute md:top-0 md:mt-0",
              step.state === "current" && isTerminal
                ? "border-red-800 bg-red-800 ring-[5px] ring-red-50"
                : DOT[step.state]
            )}
          />

          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-semibold",
                step.state === "current" && isTerminal
                  ? "font-extrabold text-red-800"
                  : LABEL[step.state]
              )}
            >
              {statusStepLabel[step.status] ?? "Trạng thái không xác định"}
            </p>
            <p className="mt-0.5 text-xs text-dark-400">
              {step.time
                ? formatDateTime(step.time)
                : upcomingHint(step, order)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default OrderTimeline;
