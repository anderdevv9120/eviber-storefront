import { describe, expect, it } from "vitest";
import type {
  CustomerOrderRefundStatus,
  RefundStage,
} from "@/@types/Refund.type";
import { getRefundBadgeStatuses } from "./refund-status";

const status = (
  overrides: Partial<CustomerOrderRefundStatus> = {}
): CustomerOrderRefundStatus => ({
  coverage: "none",
  activeStages: [],
  hasRejected: false,
  ...overrides,
});

describe("order refund badges", () => {
  it("leaves older responses and orders without refund activity alone", () => {
    expect(getRefundBadgeStatuses()).toEqual([]);
    expect(getRefundBadgeStatuses(status())).toEqual([]);
  });

  it.each([
    ["full", "fully_refunded"],
    ["partial", "partially_refunded"],
  ] as const)("shows cumulative %s coverage", (coverage, badge) => {
    expect(getRefundBadgeStatuses(status({ coverage }))).toEqual([badge]);
  });

  it.each([
    "awaiting_review",
    "awaiting_return",
    "awaiting_payout",
    "payout_in_progress",
  ] as RefundStage[])(
    "shows %s without implying a completed refund",
    (stage) => {
      expect(getRefundBadgeStatuses(status({ activeStages: [stage] }))).toEqual(
        [stage]
      );
    }
  );

  it("shows a rejected request without marking the order rejected", () => {
    expect(getRefundBadgeStatuses(status({ hasRejected: true }))).toEqual([
      "rejected",
    ]);
  });

  it("retains paid coverage alongside active and rejected requests", () => {
    expect(
      getRefundBadgeStatuses(
        status({
          coverage: "partial",
          activeStages: [
            "awaiting_return",
            "awaiting_review",
            "awaiting_return",
          ],
          hasRejected: true,
        })
      )
    ).toEqual([
      "partially_refunded",
      "awaiting_review",
      "awaiting_return",
      "rejected",
    ]);
  });
});
