import axiosRequest from "@/config/axios";
import type { IOwnerReview, IReviewEligibility } from "@/@types/Review.type";

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

export const getReviewEligibility = (
  productId: string,
  signal?: AbortSignal
): Promise<{ data: IReviewEligibility }> =>
  axiosRequest.get("/reviews/eligibility", {
    params: { productId },
    signal,
    toastError: false,
  });

export const createReview = (
  data: FormData,
  signal?: AbortSignal
): Promise<{ data: IOwnerReview }> =>
  axiosRequest.post("/reviews", data, {
    signal,
    toastError: false,
    timeout: 180_000,
  });

export const editReview = (
  id: string,
  data: FormData,
  signal?: AbortSignal
): Promise<{ data: IOwnerReview }> =>
  axiosRequest.patch(`/reviews/${encodeURIComponent(id)}`, data, {
    signal,
    toastError: false,
    timeout: 180_000,
  });
