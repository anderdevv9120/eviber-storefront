import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VoucherField, { type VoucherFieldProps } from "./VoucherField";
import CheckoutSummary from "./CheckoutSummary";
import { PATH } from "@/constants/paths";

const props: VoucherFieldProps = {
  signedIn: true,
  draftCode: "SAVE10",
  busy: false,
  onCodeChange: () => {},
  onApply: async () => {},
  onRemove: async () => {},
};

describe("voucher checkout controls (SSR)", () => {
  it("offers guests the existing safe sign-in route", () => {
    const html = renderToStaticMarkup(
      createElement(VoucherField, { ...props, signedIn: false })
    );
    expect(html).toContain("Đăng nhập để sử dụng mã giảm giá");
    expect(html).toContain(`href="${PATH.LOGIN}"`);
    expect(html).not.toContain("<input");
  });
  it("announces checkout failures and changed totals to guests too", () => {
    const notice = "Đơn hàng vừa thay đổi. Kiểm tra tổng mới rồi đặt hàng lại.";
    const html = renderToStaticMarkup(
      createElement(VoucherField, { ...props, signedIn: false, error: notice })
    );
    expect(html).toContain(notice);
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("<input");
  });
  it("keeps Remove available after a pending code draft is cleared", () => {
    const html = renderToStaticMarkup(
      createElement(VoucherField, {
        ...props,
        draftCode: "",
        pending: true,
      })
    );
    expect(html).toContain("Áp dụng mã mới hoặc gỡ mã trước khi đặt hàng.");
    // Info hint, not an error: no red text and the input is not marked invalid.
    expect(html).not.toContain("text-red-600");
    expect(html).toContain('aria-invalid="false"');
    expect(html).toMatch(/<button(?![^>]*\sdisabled=)[^>]*>Gỡ mã<\/button>/);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Áp dụng/);
  });
  it("labels the input and Apply/Remove controls without submitting the shipping form", () => {
    const html = renderToStaticMarkup(createElement(VoucherField, props));
    expect(html).toContain('for="checkout-voucher"');
    expect(html).toContain('id="checkout-voucher"');
    expect(html).toContain('value="SAVE10"');
    expect(html).toContain("Áp dụng");
    expect(html).toContain("Gỡ mã");
    expect(html).not.toContain('type="submit"');
  });
  it("announces busy/error feedback and permits removal to cancel a pending Apply", () => {
    const html = renderToStaticMarkup(
      createElement(VoucherField, {
        ...props,
        busy: true,
        error: "Mã đã hết hạn",
      })
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-describedby="checkout-voucher-feedback"');
    expect(html).toContain("Mã đã hết hạn");
    expect(html).toContain("text-red-600");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Áp dụng/);
    expect(html).toMatch(/<button(?![^>]*\sdisabled=)[^>]*>Gỡ mã<\/button>/);
  });
  it("announces only the backend applied code", () => {
    const html = renderToStaticMarkup(
      createElement(VoucherField, {
        ...props,
        draftCode: "OTHER",
        appliedCoupon: {
          couponId: "coupon-a",
          couponCode: "SAVE10",
          couponName: "Sale",
          couponDiscountType: "fixed_amount",
          couponDiscountValue: 10000,
        },
      })
    );
    expect(html).toContain("Đã áp dụng mã SAVE10");
    expect(html).not.toContain("Đã áp dụng mã OTHER");
  });
  it("shows backend voucher discount separately from sale savings", () => {
    const html = renderToStaticMarkup(
      createElement(CheckoutSummary, {
        cart: {
          cartId: "cart-a",
          combos: [],
          items: [],
          totalQuantity: 1,
          totalOriginalPrice: 100000,
          totalSavings: 20000,
          totalPrice: 80000,
        },
        totalPrice: 70000,
        shippingFee: 0,
        discountAmount: 10000,
        couponCode: "SAVE10",
        isSubmitting: false,
      })
    );
    expect(html).toContain("Tiết kiệm");
    expect(html).toContain("Mã giảm giá SAVE10");
    expect(html).toContain("10.000");
    expect(html).toContain("20.000");
    expect(html).toContain("70.000");
  });
});
