"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/store/useAppStore";
import { createReview, editReview, getReviewEligibility } from "@/apis/review";
import { ApiError } from "@/config/axios";
import type { IOwnerReview, IReviewEligibility } from "@/@types/Review.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import {
  reviewDraft,
  reviewPayload,
  reviewRequestScope,
} from "./ReviewForm.helpers";

interface Props {
  productId: string;
  onSaved?: (review: IOwnerReview) => void;
}

const statusCopy = {
  pending: "Đang chờ duyệt",
  approved: "Đã được duyệt",
  rejected: "Chưa được duyệt",
};
const buttonClass =
  "rounded-lg border border-primary-600 px-4 py-2 text-primary-700 disabled:opacity-50";
const fieldClass =
  "mt-1 w-full rounded-lg border border-white-600 bg-white p-2";

export default function ReviewForm(props: Props) {
  const customerId = useAppStore((state) => state.profile._id);
  const [identityRevision, setIdentityRevision] = useState(0);
  useEffect(() => {
    let previousId = useAppStore.getState().profile._id;
    return useAppStore.subscribe((state) => {
      if (state.profile._id === previousId) return;
      previousId = state.profile._id;
      setIdentityRevision((current) => current + 1);
    });
  }, []);
  return customerId ? (
    <CustomerReviewForm
      key={`${props.productId}:${customerId}:${identityRevision}`}
      {...props}
      customerId={customerId}
    />
  ) : (
    <p className="my-5 text-sm">
      <Link href="/login" className="font-semibold text-primary-700">
        Đăng nhập
      </Link>{" "}
      để đánh giá sản phẩm đã mua.
    </p>
  );
}

function CustomerReviewForm({
  productId,
  customerId,
  onSaved,
}: Props & { customerId: string }) {
  const errorId = useId();
  const [eligibility, setEligibility] = useState<IReviewEligibility | null>(
    null
  );
  const [baseReview, setBaseReview] = useState<IOwnerReview | null>(null);
  const [draft, setDraft] = useState(() => reviewDraft(null));
  const [previews, setPreviews] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reconcile, setReconcile] = useState(false);
  const [loading, setLoading] = useState(true);
  const scopeRef = useRef<ReturnType<typeof reviewRequestScope> | null>(null);
  const saving = useRef(false);
  const reloading = useRef(false);
  const urls = useRef(new Set<string>());

  useEffect(() => {
    const scope = reviewRequestScope(customerId);
    scopeRef.current = scope;
    getReviewEligibility(productId, scope.signal)
      .then(({ data }) => {
        if (scope.signal.aborted) return;
        setEligibility(data);
        setBaseReview(data.review);
        setDraft(reviewDraft(data.review));
      })
      .catch((cause) => {
        if (!scope.signal.aborted) setError(getErrorMessage(cause));
      })
      .finally(() => {
        if (!scope.signal.aborted) setLoading(false);
      });
    return () => scope.dispose();
  }, [productId, customerId]);

  useEffect(() => {
    const activeUrls = urls.current;
    return () => activeUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function clearPhotos() {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current.clear();
    setPreviews([]);
  }

  async function reloadOwner() {
    const scope = scopeRef.current;
    if (!scope || scope.signal.aborted || saving.current || reloading.current)
      return;
    reloading.current = true;
    setLoading(true);
    try {
      const { data } = await getReviewEligibility(productId, scope.signal);
      if (scope.signal.aborted) return;
      setEligibility(data);
      if (!reconcile) {
        setBaseReview(data.review);
        setDraft(reviewDraft(data.review));
        setError("");
      } else if (data.review) {
        onSaved?.(data.review);
      }
    } catch (cause) {
      if (!scope.signal.aborted) setError(getErrorMessage(cause));
    } finally {
      reloading.current = false;
      if (!scope.signal.aborted) setLoading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const scope = scopeRef.current;
    if (
      !scope ||
      scope.signal.aborted ||
      saving.current ||
      reconcile ||
      loading
    )
      return;
    if (
      !eligibility ||
      !(baseReview ? eligibility.canEdit : eligibility.canCreate)
    )
      return;
    setError("");
    setSuccess("");
    let payload: FormData;
    try {
      payload = reviewPayload(productId, draft, baseReview);
    } catch (cause) {
      setError(getErrorMessage(cause));
      return;
    }
    saving.current = true;
    setBusy(true);
    try {
      const { data } = baseReview
        ? await editReview(baseReview._id, payload, scope.signal)
        : await createReview(payload, scope.signal);
      if (scope.signal.aborted) return;
      setBaseReview(data);
      setEligibility({
        ...eligibility,
        review: data,
        canCreate: false,
        canEdit: true,
        reason: "already_reviewed",
      });
      setDraft(reviewDraft(data));
      clearPhotos();
      setOpen(false);
      setSuccess(
        data.status === "pending"
          ? "Đã gửi đánh giá. Nội dung sẽ hiển thị sau khi được duyệt."
          : "Đã lưu đánh giá."
      );
      onSaved?.(data);
    } catch (cause) {
      if (scope.signal.aborted) return;
      setError(getErrorMessage(cause));
      // A lost response may already have saved. Refresh before any resubmission.
      if (
        !(cause instanceof ApiError) ||
        !cause.status ||
        cause.status === 409 ||
        cause.status >= 500
      ) {
        setReconcile(true);
        setEligibility(null);
        setError(
          "Chưa thể xác nhận bản lưu. Bản nháp được giữ lại; đối chiếu đánh giá hiện tại trước khi gửi lại."
        );
        try {
          const { data } = await getReviewEligibility(productId, scope.signal);
          if (!scope.signal.aborted) {
            setEligibility(data);
            if (data.review) onSaved?.(data.review);
          }
        } catch (reloadError) {
          if (!scope.signal.aborted)
            setError(
              `Không tải được bản hiện tại: ${getErrorMessage(reloadError)}. Bản nháp vẫn được giữ lại.`
            );
        }
      }
    } finally {
      saving.current = false;
      if (!scope.signal.aborted) setBusy(false);
    }
  }

  function reconcileDraft(keepDraft: boolean) {
    if (!eligibility || scopeRef.current?.signal.aborted) return;
    const latest = eligibility.review;
    setBaseReview(latest);
    if (keepDraft) {
      setDraft({
        ...draft,
        retainedImages: draft.retainedImages.filter((image) =>
          latest?.images.includes(image)
        ),
      });
    } else {
      clearPhotos();
      setDraft(reviewDraft(latest));
    }
    setReconcile(false);
    setError("");
  }

  const canWrite =
    eligibility &&
    (eligibility.review ? eligibility.canEdit : eligibility.canCreate);
  const owner = eligibility?.review;
  return (
    <div
      className="my-5 rounded-lg border border-white-300 bg-white-50 p-5"
      aria-busy={loading || busy}
    >
      <h3 className="font-bold">Đánh giá của bạn</h3>
      {loading && (
        <p role="status" className="mt-2">
          Đang kiểm tra quyền đánh giá…
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 whitespace-pre-wrap text-red-700"
        >
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-2">
          {success}
        </p>
      )}
      {!loading && !eligibility && (
        <button
          type="button"
          disabled={busy}
          className={`${buttonClass} mt-3`}
          onClick={() =>
            reloadOwner().catch((cause) => setError(getErrorMessage(cause)))
          }
        >
          Tải lại quyền đánh giá
        </button>
      )}
      {owner && (
        <div className="mt-3 text-sm">
          <p className="font-semibold">
            {statusCopy[owner.status]} · {owner.rating} sao
          </p>
          <p className="mt-1 font-semibold">{owner.title}</p>
          <p className="mt-1 whitespace-pre-wrap break-words">
            {owner.content}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {owner.images.map((image) => (
              <Image
                key={image}
                src={resolveImageUrl(image)}
                alt="Ảnh đánh giá của bạn"
                width={80}
                height={80}
                className="h-20 w-20 rounded object-cover"
              />
            ))}
          </div>
        </div>
      )}
      {eligibility?.reason === "no_delivered_purchase" && (
        <p className="mt-2 text-sm">
          Bạn có thể đánh giá sau khi đơn hàng chứa sản phẩm này đã được giao.
        </p>
      )}
      {eligibility?.reason === "purchase_no_longer_eligible" && (
        <p className="mt-2 text-sm">
          Đơn hàng không còn đủ điều kiện chỉnh sửa đánh giá.
        </p>
      )}
      {reconcile && eligibility && !busy && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => reconcileDraft(false)}
          >
            Dùng bản hiện tại (bỏ bản nháp)
          </button>
          {canWrite && (
            <button
              type="button"
              className={buttonClass}
              onClick={() => reconcileDraft(true)}
            >
              Giữ bản nháp, chỉ giữ ảnh còn tồn tại
            </button>
          )}
        </div>
      )}
      {canWrite && !open && !reconcile && (
        <button
          type="button"
          className={`${buttonClass} mt-3`}
          onClick={() => {
            setOpen(true);
            setSuccess("");
          }}
        >
          {owner ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
        </button>
      )}
      {open && (
        <form
          className="mt-4"
          onSubmit={(event) =>
            save(event).catch((cause) => setError(getErrorMessage(cause)))
          }
          aria-describedby={error ? errorId : undefined}
        >
          <fieldset
            disabled={busy || loading || reconcile || !canWrite}
            className="space-y-4"
          >
            <legend className="mb-2 font-semibold">Nội dung đánh giá</legend>
            <fieldset>
              <legend className="text-sm">Mức sao (bắt buộc)</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label
                    key={rating}
                    className="flex min-h-11 items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      required
                      checked={draft.rating === rating}
                      onChange={() => setDraft({ ...draft, rating })}
                    />
                    {rating} sao
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              Tiêu đề (không bắt buộc)
              <input
                className={fieldClass}
                maxLength={255}
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              Nội dung (không bắt buộc)
              <textarea
                className={fieldClass}
                rows={4}
                maxLength={4000}
                value={draft.content}
                onChange={(event) =>
                  setDraft({ ...draft, content: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              Ảnh (tối đa 5, JPEG/PNG/GIF/WebP)
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="mt-2 block w-full"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  if (
                    draft.retainedImages.length +
                      draft.files.length +
                      files.length >
                    5
                  ) {
                    setError("Chỉ được đính kèm tối đa 5 ảnh.");
                    return;
                  }
                  if (
                    files.some(
                      (file) =>
                        ![
                          "image/jpeg",
                          "image/png",
                          "image/gif",
                          "image/webp",
                        ].includes(file.type)
                    )
                  ) {
                    setError("Chỉ chấp nhận ảnh JPEG, PNG, GIF, WebP.");
                    return;
                  }
                  const added = files.map((file) => {
                    const url = URL.createObjectURL(file);
                    urls.current.add(url);
                    return url;
                  });
                  setDraft({ ...draft, files: [...draft.files, ...files] });
                  setPreviews([...previews, ...added]);
                  setError("");
                }}
              />
            </label>
            <p className="text-xs">
              {draft.retainedImages.length + draft.files.length}/5 ảnh. Ảnh mới
              chỉ tải lên khi lưu. Chỉ chọn ảnh bạn muốn công khai.
            </p>
            <div className="flex flex-wrap gap-3">
              {draft.retainedImages.map((image, index) => (
                <div key={image}>
                  <Image
                    src={resolveImageUrl(image)}
                    alt={`Ảnh đã lưu ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <button
                    type="button"
                    className="min-h-11 text-sm text-primary-700"
                    aria-label={`Xóa ảnh đã lưu ${index + 1}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        retainedImages: draft.retainedImages.filter(
                          (url) => url !== image
                        ),
                      })
                    }
                  >
                    Xóa ảnh
                  </button>
                </div>
              ))}
              {previews.map((url, index) => (
                <div key={url}>
                  <Image
                    src={url}
                    unoptimized
                    alt={`Ảnh mới ${index + 1}: ${draft.files[index].name}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded object-cover"
                  />
                  <button
                    type="button"
                    className="min-h-11 text-sm text-primary-700"
                    aria-label={`Xóa ảnh mới ${index + 1}`}
                    onClick={() => {
                      URL.revokeObjectURL(url);
                      urls.current.delete(url);
                      setPreviews(
                        previews.filter((preview) => preview !== url)
                      );
                      setDraft({
                        ...draft,
                        files: draft.files.filter(
                          (_, fileIndex) => fileIndex !== index
                        ),
                      });
                    }}
                  >
                    Xóa ảnh
                  </button>
                </div>
              ))}
            </div>
            <button type="submit" className={buttonClass}>
              Lưu đánh giá
            </button>
          </fieldset>
          {busy && (
            <p role="status" className="mt-3">
              Đang tải ảnh và lưu đánh giá…
            </p>
          )}
        </form>
      )}
    </div>
  );
}
