import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ReviewSection from "./ReviewSection";
import type {
  IProductReviewItem,
  IProductReviewsResponse,
} from "@/@types/Review.type";

vi.mock("@/apis/review", () => ({ getProductReviews: vi.fn() }));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    createElement("img", { src, alt }),
}));

const render = (adminReply: IProductReviewItem["adminReply"]) => {
  const initialData: IProductReviewsResponse = {
    items: [
      {
        _id: "review",
        displayName: "Buyer",
        rating: 5,
        images: ["/images/review.png"],
        created_at: "2026-10-07T01:00:00Z",
        adminReply,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 5,
    summary: {
      ratingAvg: 5,
      total: 1,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
    },
  };
  return renderToStaticMarkup(
    createElement(ReviewSection, { productId: "product", initialData })
  );
};

describe("product shop replies", () => {
  it("omits absent replies and resolves stored image paths", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test/api/v1");
    try {
      const html = render(null);
      expect(html).not.toContain("Phản hồi từ người bán");
      expect(html).toContain('src="https://api.test/images/review.png"');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.each([false, true])(
    "renders a plain-text reply with isStale=%s",
    (isStale) => {
      const html = render({
        content: "<script>alert(1)</script>\nThank you",
        repliedAt: "2026-10-07T01:00:00Z",
        isStale,
      });
      expect(html).toContain("Phản hồi từ người bán");
      expect(html).toContain("07/10/26");
      expect(html).toContain(
        "&lt;script&gt;alert(1)&lt;/script&gt;\nThank you"
      );
      expect(html).not.toContain("<script>");
      expect(html).toContain("whitespace-pre-wrap");
      expect(html.includes("Đánh giá đã được cập nhật sau phản hồi này.")).toBe(
        isStale
      );
    }
  );
});
