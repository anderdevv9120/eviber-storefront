import type { CustomerOrderRefundStatus } from "@/@types/Refund.type";

const ACTIVE_STAGES = [
  "awaiting_review",
  "awaiting_return",
  "awaiting_payout",
  "payout_in_progress",
] as const;

export type RefundBadgeStatus =
  | (typeof ACTIVE_STAGES)[number]
  | "fully_refunded"
  | "partially_refunded"
  | "rejected";

export function getRefundBadgeStatuses(
  status?: CustomerOrderRefundStatus
): RefundBadgeStatus[] {
  if (!status) return [];
  const badges: RefundBadgeStatus[] = [];
  if (status.coverage === "full") badges.push("fully_refunded");
  else if (status.coverage === "partial") badges.push("partially_refunded");
  badges.push(
    ...ACTIVE_STAGES.filter((stage) => status.activeStages.includes(stage))
  );
  if (status.hasRejected) badges.push("rejected");
  return badges;
}
