import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { IOrderProduct } from "@/@types/Order.type";
import type { IOwnerReview, IReviewEligibility } from "@/@types/Review.type";
import OrderReviews from "./OrderReviews";
import { reviewActionLabel } from "./OrderReviewLink";

vi.mock("@/app/(main)/product/[slug]/_component/ReviewForm", () => ({
  default: ({ productId }: { productId: string }) =>
    createElement("div", { "data-review-product": productId }),
}));

const product = (productId: string, variantId = productId): IOrderProduct => ({
  productId,
  variantId,
  productNameAtOrder: `Bought ${productId}`,
  quantity: 1,
  priceAtOrder: 100,
  originalPriceAtOrder: 100,
});

describe("order reviews", () => {
  it("renders one review area per product with stable list-link targets", () => {
    const html = renderToStaticMarkup(
      createElement(OrderReviews, {
        products: [product("a", "a-red"), product("a", "a-blue"), product("b")],
      })
    );
    expect(html.match(/data-review-product=/g)).toHaveLength(2);
    for (const id of ["a", "b"]) {
      expect(html).toContain(`id="review-${id}"`);
      expect(html).toContain(`data-review-product="${id}"`);
      expect(html).toContain(`Bought ${id}`);
    }
    expect(html).not.toContain('href="/product/');
  });

  it("supports old orders without a product-name snapshot", () => {
    const html = renderToStaticMarkup(
      createElement(OrderReviews, {
        products: [{ ...product("a"), productNameAtOrder: undefined }],
      })
    );
    expect(html).toContain("Sản phẩm");
    expect(html).toContain('data-review-product="a"');
  });
});

describe("order-list review labels", () => {
  const eligibility: IReviewEligibility = {
    canCreate: true,
    canEdit: false,
    reason: "eligible",
    review: null,
  };

  it("offers writing only after eligibility is confirmed", () => {
    expect(reviewActionLabel(null)).toBeNull();
    expect(reviewActionLabel(eligibility)).toBe("Đánh giá ngay");
    expect(
      reviewActionLabel({
        ...eligibility,
        canCreate: false,
        reason: "no_delivered_purchase",
      })
    ).toBeNull();
  });

  it.each(["pending", "approved", "rejected"] as const)(
    "offers viewing a %s review even when editing is no longer eligible",
    (status) => {
      const review: IOwnerReview = {
        _id: "review",
        productId: "a",
        rating: 4,
        title: "",
        content: "",
        images: [],
        status,
        contentRevision: 0,
        adminReply: null,
        created_at: "2026-10-07",
        updated_at: "2026-10-07",
      };
      expect(
        reviewActionLabel({
          ...eligibility,
          canCreate: false,
          canEdit: false,
          reason: "purchase_no_longer_eligible",
          review,
        })
      ).toBe("Xem đánh giá");
    }
  );
});
