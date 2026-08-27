import axiosRequest from "@/config/axios";

export interface IGetProductReviewsParams {
  productId: string;
  /** 1-based; BE default 1 */
  page?: number;
  /** BE default 5, max 50 */
  pageSize?: number;
  /** Lọc theo mức sao 1-5 — chỉ ảnh hưởng items + total; summary LUÔN tính trên toàn bộ review approved */
  rating?: number;
}

export const getProductReviews = (
  params: IGetProductReviewsParams,
  signal?: AbortSignal
) => {
  return axiosRequest.get("/reviews", { params, signal });
};
