import { describe, expect, it } from "vitest";
import type {
  RefundOrderAllocationView,
  RefundOrderView,
} from "@/@types/Refund.type";
import {
  allowedReasons,
  buildRefundSelection,
  groupRefundAllocations,
  refundBlockedMessage,
  refundDraftProblems,
  wholeOrderSelection,
} from "./refund-selection";

const NOW = Date.parse("2026-10-05T10:00:00.000Z");
const DEADLINE = "2026-10-08T10:00:00.000Z";

const allocation = (
  allocationId: string,
  overrides: Partial<RefundOrderAllocationView> = {}
): RefundOrderAllocationView => ({
  allocationId,
  productInfoIndex: 0,
  productName: "Áo hoodie",
  variantLabel: "Đen / M",
  purchasedQuantity: 1,
  availableQuantity: 1,
  requestedQuantity: 0,
  refundedQuantity: 0,
  netAmount: 100000,
  availableAmount: 100000,
  requestedAmount: 0,
  refundedAmount: 0,
  productRefundEnabled: true,
  ...overrides,
});

const view = (
  allocations: RefundOrderAllocationView[],
  overrides: Partial<RefundOrderView> = {}
): RefundOrderView => ({
  orderId: "order-1",
  orderNumber: "ORD-1",
  revision: 3,
  policy: { enabled: true, windowDays: 7 },
  deadline: DEADLINE,
  eligibility: { eligible: true, reviewRequired: false, reason: null },
  allocations,
  remainingPaidShipping: 0,
  summary: {
    activeStages: [],
    paidAmount: 240000,
    paidShippingAmount: 0,
    coverage: "none",
    requestCount: 0,
    reviewRequired: false,
  },
  requests: [],
  ...overrides,
});

describe("buildRefundSelection", () => {
  it("same_variant_rounding_allocations_remain_separate", () => {
    const rounding = view([
      allocation("a-0", { productInfoIndex: 2, netAmount: 33 }),
      allocation("a-1", { productInfoIndex: 3, netAmount: 34 }),
    ]);
    const drafts = buildRefundSelection(rounding, [
      { allocationId: "a-0", quantity: 1 },
      { allocationId: "a-1", quantity: 1 },
    ]);
    expect(drafts.map((d) => d.allocationId)).toEqual(["a-0", "a-1"]);
    expect(drafts.map((d) => d.quantity)).toEqual([1, 1]);
  });

  it("missing_one_of_three_requests_one", () => {
    const three = view([
      allocation("a-0", {
        purchasedQuantity: 3,
        availableQuantity: 3,
        netAmount: 300000,
        availableAmount: 300000,
      }),
    ]);
    const [draft] = buildRefundSelection(three, [
      { allocationId: "a-0", quantity: 1 },
    ]);
    expect(draft).toMatchObject({
      allocationId: "a-0",
      quantity: 1,
      evidenceIds: [],
      explanation: "",
    });
  });

  it("selects only 80000 for combo piece A and leaves 160000 piece B unselected", () => {
    const combo = view([
      allocation("combo:A", { netAmount: 80000, availableAmount: 80000 }),
      allocation("combo:B", { netAmount: 160000, availableAmount: 160000 }),
    ]);
    const drafts = buildRefundSelection(combo, [
      { allocationId: "combo:A", quantity: 1 },
    ]);
    expect(drafts.map((d) => d.allocationId)).toEqual(["combo:A"]);
  });

  it("drops unknown, zero, fractional-only and fully reserved rows and clamps the rest to the balance", () => {
    const v = view([
      allocation("a-0", { purchasedQuantity: 3, availableQuantity: 2 }),
      allocation("a-1", { availableQuantity: 0, requestedQuantity: 1 }),
    ]);
    const drafts = buildRefundSelection(v, [
      { allocationId: "a-0", quantity: 9 },
      { allocationId: "a-0", quantity: 1 },
      { allocationId: "a-1", quantity: 1 },
      { allocationId: "ghost", quantity: 1 },
      { allocationId: "a-0", quantity: Number.NaN },
    ]);
    expect(drafts).toEqual([
      expect.objectContaining({ allocationId: "a-0", quantity: 2 }),
    ]);
  });

  it("defaults to a claim reason when ordinary refunds are off for that line", () => {
    const off = view([allocation("a-0", { productRefundEnabled: false })]);
    const [draft] = buildRefundSelection(off, [
      { allocationId: "a-0", quantity: 1 },
    ]);
    expect(draft.reason).toBe("missing_item");
  });
});

describe("wholeOrderSelection", () => {
  it("whole_order_selects_only_unreserved_eligible_remainders", () => {
    const partial = view([
      allocation("a-0", { purchasedQuantity: 3, availableQuantity: 2 }),
      allocation("a-1", { availableQuantity: 0, requestedQuantity: 1 }),
      allocation("a-2", { purchasedQuantity: 2, availableQuantity: 2 }),
    ]);
    const whole = wholeOrderSelection(partial);
    expect(whole.selected).toEqual([
      { allocationId: "a-0", quantity: 2 },
      { allocationId: "a-2", quantity: 2 },
    ]);
    expect(whole.label).toBe("Toàn bộ đơn hàng");
    expect(whole.excluded).toEqual([]);
  });

  it("excluded_items_change_whole_order_label_to_all_eligible", () => {
    const mixed = view([
      allocation("a-0"),
      allocation("a-1", { productRefundEnabled: false }),
    ]);
    const whole = wholeOrderSelection(mixed);
    expect(whole.selected).toEqual([{ allocationId: "a-0", quantity: 1 }]);
    expect(whole.label).toBe("Tất cả sản phẩm đủ điều kiện");
    expect(whole.excluded.map((a) => a.allocationId)).toEqual(["a-1"]);
  });

  it("selects nothing when the store has ordinary refunds off", () => {
    const off = view([allocation("a-0")], {
      policy: { enabled: false, windowDays: 7 },
      eligibility: {
        eligible: false,
        reviewRequired: false,
        reason: "Không hỗ trợ hoàn tiền thông thường",
      },
    });
    expect(wholeOrderSelection(off).selected).toEqual([]);
  });
});

describe("allowedReasons", () => {
  it("keeps missing and incorrect claims open when ordinary refunds are off", () => {
    const off = view([allocation("a-0", { productRefundEnabled: false })], {
      policy: { enabled: false, windowDays: 7 },
      eligibility: {
        eligible: false,
        reviewRequired: false,
        reason: "Không hỗ trợ hoàn tiền thông thường",
      },
    });
    expect(allowedReasons(off, off.allocations[0], NOW)).toEqual([
      "missing_item",
      "incorrect_item",
    ]);
  });

  it("allows every reason inside the deadline when ordinary refunds are on", () => {
    const on = view([allocation("a-0")]);
    expect(allowedReasons(on, on.allocations[0], NOW)).toEqual([
      "ordinary",
      "missing_item",
      "incorrect_item",
      "other",
    ]);
  });

  it("allows nothing before delivery, past the deadline, or while review is required", () => {
    const base = allocation("a-0");
    const blocked = [
      view([base], { deadline: null }),
      view([base], {
        eligibility: { eligible: false, reviewRequired: true, reason: "x" },
      }),
    ];
    for (const v of blocked) expect(allowedReasons(v, base, NOW)).toEqual([]);
    expect(
      allowedReasons(view([base]), base, Date.parse(DEADLINE) + 1)
    ).toEqual([]);
    expect(
      allowedReasons(view([base]), base, Date.parse(DEADLINE))
    ).not.toEqual([]);
  });
});

describe("refundDraftProblems", () => {
  const ok = view([
    allocation("a-0", { purchasedQuantity: 3, availableQuantity: 3 }),
  ]);
  const draft = (overrides = {}) => ({
    allocationId: "a-0",
    quantity: 1,
    reason: "ordinary" as const,
    explanation: "Không vừa size",
    requestedReturn: "return" as const,
    evidenceIds: [],
    ...overrides,
  });

  it("accepts a complete ordinary return request", () => {
    expect(refundDraftProblems(ok, [draft()], NOW)).toEqual([]);
  });

  it("zero_balance_cannot_submit", () => {
    const spent = view([
      allocation("a-0", { availableQuantity: 0, refundedQuantity: 1 }),
    ]);
    expect(
      buildRefundSelection(spent, [{ allocationId: "a-0", quantity: 1 }])
    ).toEqual([]);
    expect(refundDraftProblems(spent, [], NOW)).toHaveLength(1);
    expect(refundDraftProblems(spent, [draft()], NOW).length).toBeGreaterThan(
      0
    );
  });

  it("requires evidence for missing, incorrect and no-return lines", () => {
    for (const overrides of [
      { reason: "missing_item" },
      { reason: "incorrect_item" },
      { requestedReturn: "no_return" },
    ]) {
      const problems = refundDraftProblems(ok, [draft(overrides)], NOW);
      expect(problems).toEqual([
        expect.objectContaining({ allocationId: "a-0" }),
      ]);
    }
    expect(
      refundDraftProblems(
        ok,
        [draft({ reason: "missing_item", evidenceIds: ["e1"] })],
        NOW
      )
    ).toEqual([]);
  });

  it.each(["missing_item", "incorrect_item"])(
    "allows an empty description for %s but still requires proof",
    (reason) => {
      expect(
        refundDraftProblems(
          ok,
          [draft({ reason, explanation: "   ", evidenceIds: ["e1"] })],
          NOW
        )
      ).toEqual([]);
      expect(
        refundDraftProblems(
          ok,
          [draft({ reason, explanation: "", evidenceIds: [] })],
          NOW
        )
      ).toEqual([
        expect.objectContaining({
          message: "Cần đính kèm ảnh bằng chứng cho yêu cầu này",
        }),
      ]);
      expect(
        refundDraftProblems(
          ok,
          [
            draft({
              reason,
              explanation: "x".repeat(2001),
              evidenceIds: ["e1"],
            }),
          ],
          NOW
        )
      ).toHaveLength(1);
    }
  );

  it("requires a 1-2000 character explanation after trimming", () => {
    expect(
      refundDraftProblems(ok, [draft({ explanation: "   " })], NOW)
    ).toHaveLength(1);
    expect(
      refundDraftProblems(ok, [draft({ explanation: "x".repeat(2001) })], NOW)
    ).toHaveLength(1);
    expect(
      refundDraftProblems(ok, [draft({ explanation: "x".repeat(2000) })], NOW)
    ).toEqual([]);
  });

  it("rejects a reason the line no longer allows and quantities above the balance", () => {
    const off = view([allocation("a-0", { productRefundEnabled: false })]);
    expect(refundDraftProblems(off, [draft()], NOW)).toHaveLength(1);
    expect(refundDraftProblems(ok, [draft({ quantity: 4 })], NOW)).toHaveLength(
      1
    );
    expect(
      refundDraftProblems(ok, [draft({ quantity: 1.5 })], NOW)
    ).toHaveLength(1);
  });

  it("counts evidence across the whole request, at most five images", () => {
    const many = view([allocation("a-0"), allocation("a-1")]);
    const lines = [
      draft({ reason: "missing_item", evidenceIds: ["1", "2", "3"] }),
      draft({
        allocationId: "a-1",
        reason: "missing_item",
        evidenceIds: ["4", "5", "6"],
      }),
    ];
    expect(refundDraftProblems(many, lines, NOW)).toEqual([
      expect.objectContaining({ allocationId: null }),
    ]);
  });
});

describe("refundBlockedMessage", () => {
  const open = view([allocation("a-0")]);

  it("is null while at least one line can still be requested", () => {
    expect(refundBlockedMessage(open, NOW)).toBeNull();
  });

  it("explains that requests open after delivery when there is no delivery date", () => {
    expect(
      refundBlockedMessage(view([allocation("a-0")], { deadline: null }), NOW)
    ).toMatch(/sau khi đơn hàng được giao/);
  });

  it("shows the exact deadline once it has passed", () => {
    expect(refundBlockedMessage(open, Date.parse(DEADLINE) + 1)).toContain(
      "08/10/2026"
    );
  });

  it("tells a customer without a delivery event to wait for delivery or contact the store, not a staff reason", () => {
    const undelivered = view([allocation("a-0")], {
      deadline: null,
      eligibility: {
        eligible: false,
        reviewRequired: true,
        reason: "Cần xác nhận thời điểm giao hàng",
      },
    });
    const message = refundBlockedMessage(undelivered, NOW);
    expect(message).toMatch(/sau khi đơn hàng được giao/);
    expect(message).toMatch(/liên hệ cửa hàng/);
  });

  it("forwards the server reason for a legacy order that has no stored policy", () => {
    const legacy = view([allocation("a-0")], {
      policy: null,
      deadline: null,
      eligibility: {
        eligible: false,
        reviewRequired: true,
        reason: "Đơn hàng cũ cần được duyệt hoàn tiền thủ công",
      },
    });
    expect(refundBlockedMessage(legacy, NOW)).toBe(
      "Đơn hàng cũ cần được duyệt hoàn tiền thủ công"
    );
  });

  it("forwards the server reason when store review is required", () => {
    const review = view([allocation("a-0")], {
      eligibility: {
        eligible: false,
        reviewRequired: true,
        reason: "Cần xác nhận thời điểm giao hàng",
      },
    });
    expect(refundBlockedMessage(review, NOW)).toBe(
      "Cần xác nhận thời điểm giao hàng"
    );
  });

  it("says nothing is left when every quantity is reserved or refunded", () => {
    const spent = view([allocation("a-0", { availableQuantity: 0 })]);
    expect(refundBlockedMessage(spent, NOW)).toMatch(/Không còn sản phẩm/);
  });
});

describe("groupRefundAllocations", () => {
  it("groups lines of one product and variant visually but keeps every allocation id", () => {
    const groups = groupRefundAllocations([
      allocation("a-0", { productName: "Combo A", variantLabel: "Đen" }),
      allocation("b-0", { productName: "Áo", variantLabel: "Đen" }),
      allocation("a-1", { productName: "Combo A", variantLabel: "Đen" }),
      allocation("a-2", { productName: "Combo A", variantLabel: "Trắng" }),
    ]);
    expect(groups.map((g) => g.allocations.map((a) => a.allocationId))).toEqual(
      [["a-0", "a-1"], ["b-0"], ["a-2"]]
    );
    expect(groups[0]).toMatchObject({
      productName: "Combo A",
      variantLabel: "Đen",
    });
  });
});
