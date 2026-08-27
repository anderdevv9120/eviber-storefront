/**
 * Contract review — khớp BE thật (x-ecommerce-backend/src/modules/review/review.interface.ts,
 * GET /reviews?productId=&page=&pageSize=&rating=). Chỉ đọc — không có API viết review.
 */

export interface IProductReviewItem {
  _id: string;
  displayName: string;
  rating: number;
  title?: string;
  content?: string;
  images: string[];
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
