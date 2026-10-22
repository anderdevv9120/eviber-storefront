import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ICartResponse } from "@/@types/Cart.type";
import type { ICheckoutReview } from "@/@types/Order.type";
import CheckoutSummary from "./CheckoutSummary";
import VoucherField from "./VoucherField";
import {
  canSubmitReviewedCheckout,
  checkoutVoucherKey,
  couponComboNote,
  couponErrorMessage,
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

const combo = {
  lineId: "line-a",
  comboId: "combo-a",
  name: "Bộ đồ",
  slug: "bo-do",
  image: null,
  quantity: 2,
  price: 100001,
  originalPrice: 150000,
  isAvailable: true,
  unavailableReason: null,
  availableQuantity: 3,
  pieces: [
    {
      productId: "product-a",
      variantId: "variant-a",
      name: "Áo",
      slug: "ao",
      image: null,
      attributeValues: [{ name: "Size", code: "size", value: "42" }],
      itemQuantity: 2,
      lineTotal: 66667,
      originalPrice: 100000,
    },
    {
      productId: "product-b",
      variantId: "variant-b",
      name: "Quần",
      slug: "quan",
      image: null,
      attributeValues: [],
      itemQuantity: 1,
      lineTotal: 33334,
      originalPrice: 50000,
    },
  ],
} satisfies ICartResponse["combos"][number];
const comboCart: ICartResponse = {
  ...cart,
  items: [],
  combos: [combo],
  totalQuantity: 6,
  totalPrice: 200002,
  totalOriginalPrice: 300000,
  totalSavings: 99998,
};
const comboMessage = "Mã giảm giá không áp dụng cho combo";

describe("combo checkout", () => {
  it.each([
    { quantity: 3 },
    { price: 90000 },
    { isAvailable: false },
    { lineId: "line-b" },
  ])("invalidates combo approval when a line changes: %j", (change) => {
    expect(
      checkoutVoucherKey(
        "u1",
        { ...comboCart, combos: [{ ...combo, ...change }] },
        "SAVE10",
        0
      )
    ).not.toBe(checkoutVoucherKey("u1", comboCart, "SAVE10", 0));
  });

  it("keeps identical combo contents stable across ordering without mutation", () => {
    const other = { ...combo, lineId: "line-b" };
    const combos = [combo, other];
    expect(
      checkoutVoucherKey("u1", { ...comboCart, combos }, " save10 ", 3)
    ).toBe(
      checkoutVoucherKey(
        "u1",
        { ...comboCart, combos: [other, { ...combo }] },
        "SAVE10",
        3
      )
    );
    expect(combos[0]).toBe(combo);
  });

  it("notes coupon exclusion only for available combos", () => {
    expect(couponComboNote(comboCart)).toBe(comboMessage);
    expect(couponComboNote({ ...comboCart, items: cart.items })).toBe(
      comboMessage
    );
    expect(couponComboNote(cart)).toBeNull();
    expect(
      couponComboNote({
        ...comboCart,
        combos: [{ ...combo, isAvailable: false }],
      })
    ).toBeNull();
  });

  it("explains ineligibility for combos without available normal products", () => {
    const cause = Object.assign(new Error("Backend rejection"), {
      code: "COUPON_NOT_ELIGIBLE",
    });
    expect(couponErrorMessage(cause, comboCart)).toBe(comboMessage);
    expect(
      couponErrorMessage(cause, {
        ...comboCart,
        items: [{ ...cart.items[0], isAvailable: false }],
      })
    ).toBe(comboMessage);
    expect(couponErrorMessage(cause, { ...comboCart, items: cart.items })).toBe(
      "Backend rejection"
    );
    expect(couponErrorMessage(cause, cart)).toBe("Backend rejection");
    expect(
      couponErrorMessage(
        Object.assign(new Error("Expired"), { code: "COUPON_EXPIRED" }),
        comboCart
      )
    ).toBe("Expired");
    expect(couponErrorMessage(null, comboCart)).toBe(
      "Có lỗi xảy ra, vui lòng thử lại"
    );
  });

  it("shows the exclusion note under the voucher field", () => {
    const html = renderToStaticMarkup(
      createElement(VoucherField, {
        cart: comboCart,
        signedIn: true,
        draftCode: "",
        busy: false,
        onCodeChange: () => {},
        onApply: async () => {},
        onRemove: async () => {},
      })
    );
    expect(html).toContain(comboMessage);
  });

  it("groups reviewed pieces and scales their totals by combo count only", () => {
    const review: ICheckoutReview = {
      products: [],
      combos: [
        {
          ...combo,
          picks: combo.pieces.map((piece) => ({
            productId: piece.productId,
            variantId: piece.variantId,
            itemQuantity: piece.itemQuantity,
          })),
        },
      ],
      subtotal: 200002,
      totalPrice: 200002,
      shippingFee: 0,
      discountAmount: 0,
    };
    const html = renderToStaticMarkup(
      createElement(CheckoutSummary, {
        cart: comboCart,
        review,
        totalPrice: review.totalPrice,
        shippingFee: 0,
        isSubmitting: false,
      })
    );
    expect(html).toContain("COMBO · 3 món");
    expect(html).toContain("Bộ đồ");
    expect(html).toContain("Size 42");
    expect(html).toContain("×4");
    expect(html).toContain("133.334");
    expect(html).toContain("66.668");
    expect(html).toContain("200.000");
    expect(html).toContain("100.000");
    expect(html).not.toContain("266.668");
    expect(html).not.toContain("undefined");
  });
});
