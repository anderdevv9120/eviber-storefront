import type { CustomerOrderRefundStatus } from "@/@types/Refund.type";
import { cn } from "@/config/utils";
import {
  getRefundBadgeStatuses,
  type RefundBadgeStatus,
} from "@/utils/refund-status";

const BADGES: Record<RefundBadgeStatus, { label: string; color: string }> = {
  fully_refunded: {
    label: "Đã hoàn tiền toàn bộ",
    color: "bg-green-50 text-green-700 ring-green-700/25",
  },
  partially_refunded: {
    label: "Đã hoàn tiền một phần",
    color: "bg-yellow-50 text-yellow-800 ring-yellow-500/30",
  },
  awaiting_review: {
    label: "Chờ duyệt hoàn tiền",
    color: "bg-yellow-50 text-yellow-800 ring-yellow-500/30",
  },
  awaiting_return: {
    label: "Chờ trả hàng",
    color: "bg-blue-50 text-blue-700 ring-blue-400/30",
  },
  awaiting_payout: {
    label: "Chờ hoàn tiền",
    color: "bg-yellow-50 text-yellow-800 ring-yellow-500/30",
  },
  payout_in_progress: {
    label: "Đang hoàn tiền",
    color: "bg-blue-50 text-blue-700 ring-blue-400/30",
  },
  rejected: {
    label: "Yêu cầu hoàn tiền bị từ chối",
    color: "bg-red-50 text-red-800 ring-red-800/25",
  },
};

export default function OrderRefundBadges({
  status,
}: {
  status?: CustomerOrderRefundStatus;
}) {
  return getRefundBadgeStatuses(status).map((badge) => (
    <span
      key={badge}
      className={cn(
        "inline-flex min-h-[26px] max-w-full items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset",
        BADGES[badge].color
      )}
    >
      {BADGES[badge].label}
    </span>
  ));
}
