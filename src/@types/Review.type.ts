/**
 * Contract review — khớp BE thật (x-ecommerce-backend/src/modules/review/review.interface.ts,
 * GET /reviews?productId=&page=&pageSize=&rating= and authenticated owner routes).
 */

export interface IProductReviewItem {
  _id: string;
  displayName: string;
  rating: number;
  title?: string;
  content?: string;
  images: string[];
  adminReply: { content: string; repliedAt: string; isStale: boolean } | null;
  created_at: string;
}

export interface IReviewSummary {
  ratingAvg: number;
  total: number;
  /** Đếm số review theo mức sao 1-5 — nguồn cho histogram + count trên chips lọc */
  ratingCounts: Record<number, number>;
}

export interface IProductReviewsResponse {
  items: IProductReviewItem[];
  total: number;
  page: number;
  pageSize: number;
  summary: IReviewSummary;
}

/** Private allowlist from ReviewCustomerService.ownerRow. */
export interface IOwnerReview {
  _id: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  contentRevision: number;
  adminReply: IProductReviewItem["adminReply"];
  created_at: string;
  updated_at: string;
}

export interface IReviewEligibility {
  canCreate: boolean;
  canEdit: boolean;
  reason:
    | "eligible"
    | "already_reviewed"
    | "no_delivered_purchase"
    | "purchase_no_longer_eligible";
  review: IOwnerReview | null;
}
