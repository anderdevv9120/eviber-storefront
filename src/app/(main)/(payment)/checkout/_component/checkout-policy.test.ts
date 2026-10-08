import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/config/axios";
import { canSubmitReviewedCheckout } from "./voucher-policy";
import {
  canSubmitCheckout,
  getCheckoutPolicyKey,
  getCheckoutPolicyError,
  type GuestCheckoutState,
} from "./checkout-policy";

vi.mock("@/utils/cookies", () => ({ getCookie: () => undefined }));
vi.mock("@/store/useAppStore", () => ({ useAppStore: {} }));
vi.mock("@/utils/toast", () => ({ errorToast: vi.fn() }));

describe("guest checkout submission", () => {
  it("does not revive prior approval after A -> B -> A or guest -> user -> guest", () => {
    const initialKey = getCheckoutPolicyKey("guest:cart:1", 0);
    const allowed: GuestCheckoutState = {
      key: initialKey,
      status: "allowed",
      reviewReady: true,
    };
    expect(initialKey).toBe("guest:cart:1:0");
    expect(canSubmitCheckout(false, initialKey, allowed)).toBe(true);
    expect(
      canSubmitCheckout(false, getCheckoutPolicyKey("guest:cart:2", 1), allowed)
    ).toBe(false);
    expect(
      canSubmitCheckout(true, getCheckoutPolicyKey("user:cart:1", 1), undefined)
    ).toBe(true);
    const returnedKey = getCheckoutPolicyKey("guest:cart:1", 2);
    expect(returnedKey).toBe("guest:cart:1:2");
    expect(canSubmitCheckout(false, returnedKey, allowed)).toBe(false);
    expect(canSubmitCheckout(false, returnedKey, undefined)).toBe(false);
  });

  it("requires the current cart/account, confirmed ON and successful review", () => {
    const allowed: GuestCheckoutState = {
      key: "guest:cart:1",
      status: "allowed",
      reviewReady: true,
    };
    expect(canSubmitCheckout(false, "guest:cart:1", undefined)).toBe(false);
    expect(
      canSubmitCheckout(false, "guest:cart:1", {
        ...allowed,
        key: "old:cart:1",
      })
    ).toBe(false);
    expect(
      canSubmitCheckout(false, "guest:cart:1", {
        ...allowed,
        reviewReady: false,
      })
    ).toBe(false);
    expect(canSubmitCheckout(false, "guest:cart:1", allowed)).toBe(true);
    expect(canSubmitCheckout(false, "guest:cart:2", allowed)).toBe(false);
    expect(canSubmitCheckout(false, "other:cart:1", allowed)).toBe(false);
    expect(canSubmitCheckout(true, "user:cart:1", undefined)).toBe(true);
    expect(canSubmitCheckout(false, "guest:cart:1", undefined)).toBe(false);
  });

  it.each(["loading", "disabled", "unavailable"] as const)(
    "blocks %s even with fallback totals or an old successful review",
    (status) => {
      expect(
        canSubmitCheckout(false, "guest:cart:1", {
          key: "guest:cart:1",
          status,
          reviewReady: true,
        })
      ).toBe(false);
    }
  );

  it.each([
    [new ApiError("Disabled", 403, "GUEST_CHECKOUT_DISABLED"), "disabled"],
    [
      new ApiError("Retry", 503, "CHECKOUT_SETTINGS_UNAVAILABLE"),
      "unavailable",
    ],
    [new Error("Unknown review failure"), undefined],
  ] as const)(
    "review failures never authorize guest fallback",
    (cause, expected) => {
      expect(getCheckoutPolicyError(cause)).toBe(expected);
      expect(
        canSubmitCheckout(false, "guest:cart:1", {
          key: "guest:cart:1",
          status: getCheckoutPolicyError(cause) ?? "unavailable",
          reviewReady: false,
        })
      ).toBe(false);
    }
  );
});

describe("checkout policy errors", () => {
  it("maps validated ApiError codes only, without message or status matching", () => {
    for (const cause of [
      new ApiError("GUEST_CHECKOUT_DISABLED", 403),
      new ApiError("Other failure", 503, "OTHER"),
      new Error("CHECKOUT_SETTINGS_UNAVAILABLE"),
      { code: "GUEST_CHECKOUT_DISABLED" },
      null,
    ]) {
      expect(getCheckoutPolicyError(cause)).toBeUndefined();
    }
  });
});

describe("voucher review preserves guest policy", () => {
  it.each(["disabled", "unavailable", "loading"] as const)(
    "cannot bypass %s with a successful discounted review",
    (status) => {
      expect(
        canSubmitReviewedCheckout({
          currentKey: "current",
          acceptedKey: "current",
          hasPendingDraft: false,
          reviewReady: true,
          existingPolicyAllowed: canSubmitCheckout(false, "current", {
            key: "current",
            status,
            reviewReady: true,
          }),
        })
      ).toBe(false);
    }
  );
});
