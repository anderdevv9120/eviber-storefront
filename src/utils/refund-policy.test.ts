import { describe, expect, it } from "vitest";
import type { RefundPolicyState } from "@/@types/Refund.type";
import {
  REFUND_POLICY_UNAVAILABLE_TEXT,
  checkoutRefundPolicy,
  isRefundPolicy,
  refundPolicyText,
} from "./refund-policy";

const sevenDays = { enabled: true, windowDays: 7 };
const claims7 =
  "Nếu thiếu hàng hoặc nhận sai sản phẩm, bạn vẫn có thể gửi yêu cầu kèm bằng chứng trong 7 ngày kể từ khi đơn hàng được giao.";

describe("refundPolicyText", () => {
  it("states the active seven-day policy as a duration from delivery", () => {
    expect(
      refundPolicyText({ ...sevenDays, productRefundEnabled: true })
    ).toEqual({
      ordinary: "Hỗ trợ hoàn tiền trong 7 ngày kể từ khi đơn hàng được giao.",
      claims: claims7,
    });
  });

  it("follows the configured duration instead of a hard-coded window", () => {
    const text = refundPolicyText({
      enabled: true,
      windowDays: 14,
      productRefundEnabled: true,
    });
    expect(text.ordinary).toContain("14 ngày");
    expect(text.claims).toContain("14 ngày");
    expect(`${text.ordinary}${text.claims}`).not.toContain("7 ngày");
  });

  it("denies ordinary refunds when the store is OFF but keeps the claims path", () => {
    const text = refundPolicyText({
      enabled: false,
      windowDays: 7,
      productRefundEnabled: true,
    });
    expect(text.ordinary).toBe(
      "Cửa hàng hiện không hỗ trợ hoàn tiền thông thường."
    );
    expect(text.claims).toBe(claims7);
  });

  it("denies ordinary refunds for an excluded product but keeps the claims path", () => {
    const text = refundPolicyText({
      ...sevenDays,
      productRefundEnabled: false,
    });
    expect(text.ordinary).toBe(
      "Sản phẩm này không áp dụng hoàn tiền thông thường."
    );
    expect(text.claims).toBe(claims7);
  });

  it("lets the store switch win when both toggles are OFF", () => {
    const text = refundPolicyText({
      enabled: false,
      windowDays: 7,
      productRefundEnabled: false,
    });
    expect(text.ordinary).toBe(
      "Cửa hàng hiện không hỗ trợ hoàn tiền thông thường."
    );
    expect(text.claims).toBe(claims7);
  });

  it("gives each combo constituent its own ordinary text under one claims text", () => {
    const [included, excluded] = [true, false].map((productRefundEnabled) =>
      refundPolicyText({ ...sevenDays, productRefundEnabled })
    );
    expect(included.ordinary).not.toBe(excluded.ordinary);
    expect(included.claims).toBe(excluded.claims);
  });

  it("never shows an exact deadline before delivery", () => {
    const text = refundPolicyText({ ...sevenDays, productRefundEnabled: true });
    expect(`${text.ordinary}${text.claims}`).toContain(
      "kể từ khi đơn hàng được giao"
    );
    expect(`${text.ordinary}${text.claims}`).not.toMatch(/\d{1,2}\/\d{1,2}/);
  });

  it.each([0, 366, 1.5, Number.NaN, -7])(
    "rejects the impossible duration %s instead of guessing",
    (windowDays) => {
      expect(() =>
        refundPolicyText({
          enabled: true,
          windowDays,
          productRefundEnabled: true,
        })
      ).toThrow(RangeError);
    }
  );
});

describe("isRefundPolicy", () => {
  it("accepts the backend shape within the 1-365 day range", () => {
    expect(
      isRefundPolicy({ enabled: false, windowDays: 365, revision: 0 })
    ).toBe(true);
    expect(isRefundPolicy({ enabled: true, windowDays: 1, revision: 12 })).toBe(
      true
    );
  });

  it.each([
    null,
    "policy",
    {},
    { enabled: "true", windowDays: 7, revision: 1 },
    { enabled: true, windowDays: 0, revision: 1 },
    { enabled: true, windowDays: 366, revision: 1 },
    { enabled: true, windowDays: 7.5, revision: 1 },
    { enabled: true, windowDays: 7 },
    { enabled: true, windowDays: 7, revision: -1 },
  ])("rejects malformed policy data %j", (value) => {
    expect(isRefundPolicy(value)).toBe(false);
  });
});

describe("checkoutRefundPolicy", () => {
  const ready: RefundPolicyState = {
    status: "ready",
    policy: { enabled: true, windowDays: 7, revision: 3 },
  };

  it("keeps a policy that matches the reviewed revision", () => {
    expect(checkoutRefundPolicy(ready, 3)).toBe(ready);
  });

  it("treats a policy from another revision as unavailable, never as the reviewed terms", () => {
    expect(checkoutRefundPolicy(ready, 4)).toEqual({ status: "unavailable" });
  });

  it("passes loading and unavailable states through", () => {
    expect(checkoutRefundPolicy({ status: "loading" }, 3)).toEqual({
      status: "loading",
    });
    expect(checkoutRefundPolicy({ status: "unavailable" }, 3)).toEqual({
      status: "unavailable",
    });
  });
});

describe("unavailable policy copy", () => {
  it("says the policy cannot be loaded and does not promise refunds", () => {
    expect(REFUND_POLICY_UNAVAILABLE_TEXT).toBe(
      "Chưa tải được chính sách hoàn tiền hiện tại. Vui lòng thử lại sau."
    );
    expect(REFUND_POLICY_UNAVAILABLE_TEXT).not.toMatch(/Hỗ trợ hoàn tiền/);
  });
});
