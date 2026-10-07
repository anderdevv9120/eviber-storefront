import type { IOwnerReview } from "@/@types/Review.type";
import { useAppStore } from "@/store/useAppStore";

export interface ReviewDraft {
  rating: number;
  title: string;
  content: string;
  retainedImages: string[];
  files: File[];
}

export const reviewDraft = (review: IOwnerReview | null): ReviewDraft => ({
  rating: review?.rating ?? 0,
  title: review?.title ?? "",
  content: review?.content ?? "",
  retainedImages: [...(review?.images ?? [])],
  files: [],
});

export function reviewPayload(
  productId: string,
  draft: ReviewDraft,
  review: IOwnerReview | null
) {
  if (!Number.isInteger(draft.rating) || draft.rating < 1 || draft.rating > 5)
    throw new Error("Vui lòng chọn từ 1 đến 5 sao.");
  if (draft.title.trim().length > 255 || draft.content.trim().length > 4000)
    throw new Error("Tiêu đề tối đa 255 ký tự, nội dung tối đa 4000 ký tự.");
  if (draft.retainedImages.length + draft.files.length > 5)
    throw new Error("Chỉ được đính kèm tối đa 5 ảnh.");
  if (
    new Set(draft.retainedImages).size !== draft.retainedImages.length ||
    draft.retainedImages.some((image) => !review?.images.includes(image))
  )
    throw new Error("Ảnh giữ lại phải thuộc đánh giá hiện tại.");
  const data = new FormData();
  data.set("rating", String(draft.rating));
  data.set("title", draft.title.trim());
  data.set("content", draft.content.trim());
  if (review) {
    data.set("expectedContentRevision", String(review.contentRevision));
    data.set("retainedImages", JSON.stringify(draft.retainedImages));
  } else {
    data.set("productId", productId);
  }
  draft.files.forEach((file) => data.append("images", file));
  return data;
}

/** Abort immediately on identity changes, including A → B → A before rendering. */
export function reviewRequestScope(customerId: string) {
  const controller = new AbortController();
  const unsubscribe = useAppStore.subscribe((state) => {
    if (state.profile._id !== customerId) controller.abort();
  });
  if (useAppStore.getState().profile._id !== customerId) controller.abort();
  return {
    signal: controller.signal,
    dispose() {
      controller.abort();
      unsubscribe();
    },
  };
}
