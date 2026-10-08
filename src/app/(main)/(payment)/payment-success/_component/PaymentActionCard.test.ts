import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { IOrderCheckoutInfo } from "@/@types/Order.type";
import {
  CHECKOUT_PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/constants/payment";
import PaymentActionCard from "./PaymentActionCard";
import OrderSummaryPanel from "./OrderSummaryPanel";

const summary = (checkoutInfo: IOrderCheckoutInfo) =>
  renderToStaticMarkup(
    createElement(OrderSummaryPanel, { products: [], checkoutInfo })
  );

describe("free-order payment display (SSR)", () => {
  it("states no payment is required without bank or cash instructions", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentActionCard, {
        method: "NO_PAYMENT",
        paymentStatus: "not_required",
        totalPrice: 0,
        orderNumber: "ORD-FREE",
        bankState: null,
        now: new Date("2026-10-08T00:00:00Z"),
      })
    );
    expect(html).toContain("Không cần thanh toán");
    expect(html).not.toContain('data-testid="bank-transfer-guide"');
    expect(html).not.toContain('data-testid="bank-transfer-qr"');
    expect(html).not.toContain("Chuẩn bị");
  });

  it("labels the persisted free method/status but never offers it at checkout", () => {
    expect(PAYMENT_METHOD_LABEL.NO_PAYMENT).toBe("Không cần thanh toán");
    expect(PAYMENT_STATUS_LABEL.not_required).toBe("Không cần thanh toán");
    expect(
      CHECKOUT_PAYMENT_METHODS.map((method) => method.value as string)
    ).not.toContain("NO_PAYMENT");
  });
});

describe("saved voucher display (SSR)", () => {
  const base: IOrderCheckoutInfo = {
    subtotal: 200_000,
    shippingFee: 0,
    discountAmount: 50_000,
    totalPrice: 150_000,
  };

  it("shows a fixed voucher from the order snapshot, not a percentage", () => {
    const html = summary({
      ...base,
      couponCode: "SAVE50K",
      couponName: "Giảm 50K",
      couponDiscountType: "fixed_amount",
      couponDiscountValue: 50_000,
    });
    expect(html).toContain("Mã giảm giá SAVE50K · 50.000đ");
    expect(html).toContain("−50.000đ");
    expect(html).not.toContain("%");
  });

  it("shows a stored percentage voucher by its snapshot value", () => {
    const html = summary({
      ...base,
      couponCode: "SAVE25",
      couponDiscountType: "percentage",
      couponDiscountValue: 25,
      couponDiscountPercentage: 25,
    });
    expect(html).toContain("Mã giảm giá SAVE25 · 25%");
  });

  it("keeps legacy code/percentage fallbacks for orders without a type", () => {
    expect(
      summary({ ...base, couponCode: "OLD10", couponDiscountPercentage: 10 })
    ).toContain("Mã giảm giá OLD10 · 10%");
    expect(summary({ ...base, couponCode: "OLD" })).toContain(
      "Mã giảm giá OLD<"
    );
    expect(summary(base)).toContain("Giảm giá<");
  });
});
