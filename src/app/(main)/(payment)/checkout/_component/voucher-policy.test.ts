import { describe, expect, it } from "vitest";
import type { ICartResponse } from "@/@types/Cart.type";
import {
  canSubmitReviewedCheckout,
  checkoutVoucherKey,
  createVoucherReviewScope,
} from "./voucher-policy";

const cart: ICartResponse = {
  combos: [],
  cartId: "cart-a",
  totalQuantity: 1,
  totalOriginalPrice: 100000,
  totalPrice: 80000,
  totalSavings: 20000,
  items: [
    {
      variantId: "variant-a",
      name: "A",
      slug: "a",
      image: "",
      price: 80000,
      originalPrice: 100000,
      discountPercentage: 20,
      quantity: 1,
      isAvailable: true,
      availableQuantity: 3,
      attributeValues: [],
    },
  ],
};
const approval = {
  currentKey: "current",
  acceptedKey: "current",
  hasPendingDraft: false,
  reviewReady: true,
  existingPolicyAllowed: true,
};
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (cause: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

describe("voucher approval", () => {
  it("detects same-quantity substitutions, selling prices and availability", () => {
    const key = checkoutVoucherKey("u1", cart, "SAVE10", 0);
    for (const item of [
      { ...cart.items[0], variantId: "variant-b" },
      { ...cart.items[0], price: 70000 },
      { ...cart.items[0], isAvailable: false },
    ]) {
      expect(
        checkoutVoucherKey("u1", { ...cart, items: [item] }, "SAVE10", 0)
      ).not.toBe(key);
    }
  });
  it("normalizes code and item ordering without mutating the cart", () => {
    const items = [
      cart.items[0],
      { ...cart.items[0], variantId: "variant-b", quantity: 2 },
    ];
    expect(checkoutVoucherKey("u1", { ...cart, items }, " save10 ", 3)).toBe(
      checkoutVoucherKey(
        "u1",
        { ...cart, items: [...items].reverse() },
        "SAVE10",
        3
      )
    );
    expect(items[0].variantId).toBe("variant-a");
  });
  it.each([
    { acceptedKey: undefined },
    { acceptedKey: "old" },
    { hasPendingDraft: true },
    { reviewReady: false },
    { existingPolicyAllowed: false },
  ])("blocks unapproved checkout %j", (change) => {
    expect(canSubmitReviewedCheckout({ ...approval, ...change })).toBe(false);
  });
  it("allows only an accepted current successful review", () => {
    expect(canSubmitReviewedCheckout(approval)).toBe(true);
  });
  it.each(["account", "cart", "code"])(
    "invalidates %s A-B-A even before React renders",
    async (part) => {
      const scope = createVoucherReviewScope();
      const old = deferred<string>();
      const pending = scope.run("A", () => old.promise);
      const first = scope.key;
      scope.sync(`${part}-B`);
      scope.sync("A");
      expect(scope.key).not.toBe(first);
      old.resolve("stale approval");
      expect(await pending).toBeUndefined();
    }
  );
  it("Apply -> Remove -> late Apply keeps the removal result", async () => {
    const scope = createVoucherReviewScope();
    const old = deferred<string>();
    let signal!: AbortSignal;
    const apply = scope.run("SAVE10", (currentSignal) => {
      signal = currentSignal;
      return old.promise;
    });
    const remove = await scope.run("", async () => "full-price review");
    old.resolve("old discount");
    expect(signal.aborted).toBe(true);
    expect(await apply).toBeUndefined();
    expect(remove?.data).toBe("full-price review");
  });
  it("editing a draft aborts approval, including an ignored cancellation failure", async () => {
    const scope = createVoucherReviewScope();
    const old = deferred<string>();
    const pending = scope.run("A", () => old.promise);
    scope.invalidate();
    old.reject(new Error("late network error"));
    expect(await pending).toBeUndefined();
  });
  it("current failures remain failures and never authorize fallback totals", async () => {
    const scope = createVoucherReviewScope();
    await expect(
      scope.run("A", async () => {
        throw new Error("invalid voucher");
      })
    ).rejects.toThrow("invalid voucher");
  });
});
