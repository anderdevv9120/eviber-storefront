"use client";

import { useRef, useState } from "react";
import type { RefundOrderView, RefundSelection } from "@/@types/Refund.type";
import { submitRefund, uploadRefundEvidence } from "@/apis/refund";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { ApiError } from "@/config/axios";
import { useNow } from "@/hooks/useNow";
import { formatPrice } from "@/utils/formatPrice";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  MAX_REFUND_EVIDENCE,
  MAX_REFUND_EXPLANATION,
  REFUND_REASON_LABEL,
  allowedReasons,
  buildRefundSelection,
  groupRefundAllocations,
  refundBlockedMessage,
  refundDraftProblems,
  refundEvidenceRequired,
  refundExplanationRequired,
  wholeOrderSelection,
} from "@/utils/refund-selection";

const EVIDENCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;

const fieldClass =
  "mt-1 w-full rounded-lg border border-white-600 bg-white p-2 text-sm";

type Detail = Partial<
  Pick<RefundSelection, "reason" | "explanation" | "requestedReturn">
> & { evidence?: { id: string; file: File; evidenceId?: string }[] };

interface RefundRequestFormProps {
  view: RefundOrderView;
  sessionToken?: string;
  /** Response submit là view mới nhất đã commit */
  onViewChange: (view: RefundOrderView) => void;
  /** Tải lại view (409/kết quả chưa rõ) — form giữ nguyên bản nháp */
  onReload: () => void;
}

export default function RefundRequestForm({
  view,
  sessionToken,
  onViewChange,
  onReload,
}: RefundRequestFormProps) {
  const now = useNow().getTime();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [details, setDetails] = useState<Record<string, Detail>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string>();
  // Một key cho một payload: giữ qua lần gửi lại khi kết quả chưa rõ, đổi khi khách sửa nội dung
  const attempt = useRef<{ key: string; fingerprint: string }>(null);

  const blocked = refundBlockedMessage(view, now);
  const whole = wholeOrderSelection(view);

  // Dẫn xuất khi render: dòng chọn, lý do, tổng — không giữ bản sao trong state
  const drafts: RefundSelection[] = buildRefundSelection(
    view,
    Object.entries(quantities).map(([allocationId, quantity]) => ({
      allocationId,
      quantity,
    }))
  ).map((base) => {
    const detail = details[base.allocationId] ?? {};
    const reason = detail.reason ?? base.reason;
    return {
      ...base,
      reason,
      explanation: detail.explanation ?? "",
      // Hàng thiếu thì không có gì để gửi trả
      requestedReturn:
        reason === "missing_item"
          ? "no_return"
          : (detail.requestedReturn ?? "return"),
      evidenceIds: (detail.evidence ?? []).map((entry) => entry.id),
    };
  });
  const problems = refundDraftProblems(view, drafts, now);
  const evidenceTotal = drafts.reduce(
    (sum, d) => sum + d.evidenceIds.length,
    0
  );

  if (blocked) {
    return (
      <p role="status" className="text-sm text-dark-500">
        {blocked}
      </p>
    );
  }

  const setDetail = (allocationId: string, patch: Detail) =>
    setDetails((current) => ({
      ...current,
      [allocationId]: { ...current[allocationId], ...patch },
    }));

  const toggle = (allocationId: string, checked: boolean) =>
    setQuantities((current) => {
      const rest = { ...current };
      delete rest[allocationId];
      return checked ? { ...rest, [allocationId]: 1 } : rest;
    });

  const selectEvidence = (allocationId: string, files: File[]) => {
    setUploadErrors((current) => ({ ...current, [allocationId]: "" }));
    let count = evidenceTotal;
    for (const file of files) {
      const rejection = !EVIDENCE_MIME_TYPES.includes(file.type)
        ? "Chỉ nhận ảnh JPEG, PNG, GIF hoặc WebP"
        : file.size > EVIDENCE_MAX_BYTES
          ? "Mỗi ảnh tối đa 5 MB"
          : count >= MAX_REFUND_EVIDENCE
            ? `Mỗi yêu cầu đính kèm tối đa ${MAX_REFUND_EVIDENCE} ảnh`
            : "";
      if (rejection) {
        setUploadErrors((current) => ({
          ...current,
          [allocationId]: `${file.name}: ${rejection}`,
        }));
        return;
      }
      count += 1;
      setDetails((current) => ({
        ...current,
        [allocationId]: {
          ...current[allocationId],
          evidence: [
            ...(current[allocationId]?.evidence ?? []),
            { id: crypto.randomUUID(), file },
          ],
        },
      }));
    }
  };

  const removeEvidence = (allocationId: string, evidenceId: string) =>
    setDetails((current) => ({
      ...current,
      [allocationId]: {
        ...current[allocationId],
        evidence: (current[allocationId]?.evidence ?? []).filter(
          (entry) => entry.id !== evidenceId
        ),
      },
    }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (problems.length || isSubmitting) return;
    setIsSubmitting(true);
    setNotice(undefined);
    try {
      const items: RefundSelection[] = [];
      for (const draft of drafts) {
        const evidenceIds: string[] = [];
        for (const entry of details[draft.allocationId]?.evidence ?? []) {
          let evidenceId = entry.evidenceId;
          if (!evidenceId) {
            try {
              const { data } = await uploadRefundEvidence(
                view.orderNumber,
                entry.file,
                { sessionToken }
              );
              evidenceId = data.evidenceId;
              const uploadedId = evidenceId;
              setDetails((current) => ({
                ...current,
                [draft.allocationId]: {
                  ...current[draft.allocationId],
                  evidence: current[draft.allocationId]?.evidence?.map(
                    (image) =>
                      image.id === entry.id
                        ? { ...image, evidenceId: uploadedId }
                        : image
                  ),
                },
              }));
            } catch (error) {
              if (error instanceof ApiError && error.status === 401) onReload();
              setUploadErrors((current) => ({
                ...current,
                [draft.allocationId]: `${entry.file.name}: ${getErrorMessage(error)}`,
              }));
              return;
            }
          }
          evidenceIds.push(evidenceId);
        }
        items.push({ ...draft, evidenceIds });
      }
      setUploadErrors({});
      const fingerprint = JSON.stringify(items);
      if (attempt.current?.fingerprint !== fingerprint) {
        attempt.current = { key: crypto.randomUUID(), fingerprint };
      }
      const { data } = await submitRefund(
        view.orderNumber,
        { idempotencyKey: attempt.current.key, items },
        { sessionToken }
      );
      attempt.current = null;
      setQuantities({});
      setDetails({});
      setUploadErrors({});
      setAttempted(false);
      onViewChange(data);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      if (status === 409) {
        onReload();
        setNotice(
          `${getErrorMessage(error)} Đã tải lại số lượng còn hoàn được — nội dung bạn nhập vẫn được giữ, hãy kiểm tra rồi gửi lại.`
        );
      } else if (status === undefined || status >= 500) {
        // Kết quả chưa rõ: tải lại lịch sử, giữ key để gửi lại không tạo yêu cầu trùng
        onReload();
        setNotice(
          "Chưa xác nhận được kết quả gửi yêu cầu. Đã tải lại lịch sử bên dưới — nếu yêu cầu chưa xuất hiện, bấm Gửi lại (hệ thống không tạo trùng)."
        );
      } else if (status === 401) {
        // Phiên khách hết hạn: panel tải lại view, nhận 401 và chuyển sang xin link mới
        onReload();
        setNotice(getErrorMessage(error));
      } else {
        setNotice(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const problemFor = (allocationId: string) =>
    attempted
      ? problems.filter((problem) => problem.allocationId === allocationId)
      : [];
  const requestProblems = attempted
    ? problems.filter((problem) => problem.allocationId === null)
    : [];

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-dark-300">
          Chọn sản phẩm cần hoàn tiền
        </h3>
        {whole.selected.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            className="px-4"
            onClick={() =>
              setQuantities(
                Object.fromEntries(
                  whole.selected.map((row) => [row.allocationId, row.quantity])
                )
              )
            }
          >
            Chọn {whole.label.toLowerCase()}
          </Button>
        )}
      </div>
      {whole.excluded.length > 0 && whole.selected.length > 0 && (
        <p className="text-xs text-dark-400">
          Không áp dụng hoàn tiền thông thường cho:{" "}
          {whole.excluded.map((a) => a.productName).join(", ")}. Nếu thiếu hoặc
          nhận sai hàng, bạn vẫn có thể chọn riêng sản phẩm đó.
        </p>
      )}

      {groupRefundAllocations(view.allocations).map((group) => (
        <fieldset
          key={`${group.productName}|${group.variantLabel}`}
          className="rounded-lg border border-white-300 p-3"
        >
          <legend className="px-1 text-sm font-semibold">
            {group.productName}
            {group.variantLabel && ` · ${group.variantLabel}`}
          </legend>
          {group.allocations.map((allocation, position) => {
            const draft = drafts.find(
              (d) => d.allocationId === allocation.allocationId
            );
            const selected = Boolean(draft);
            const reasons = allowedReasons(view, allocation, now);
            const idBase = `refund-${allocation.allocationId}`;
            const rowLabel =
              group.allocations.length > 1
                ? `${group.productName} — dòng mua ${position + 1}`
                : group.productName;
            const rowProblems = problemFor(allocation.allocationId);
            const detail = details[allocation.allocationId];
            return (
              <div
                key={allocation.allocationId}
                className="border-t border-white-200 py-3 first:border-t-0"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id={idBase}
                    type="checkbox"
                    className="h-4 w-4"
                    disabled={isSubmitting || allocation.availableQuantity < 1}
                    checked={selected}
                    onChange={(event) =>
                      toggle(allocation.allocationId, event.target.checked)
                    }
                  />
                  <label htmlFor={idBase} className="text-sm">
                    {group.allocations.length > 1 && (
                      <span className="font-medium">
                        Dòng mua {position + 1} ·{" "}
                      </span>
                    )}
                    đã mua {allocation.purchasedQuantity} · còn hoàn được{" "}
                    {allocation.availableQuantity}
                    {allocation.availableQuantity > 0 &&
                      ` (tối đa ${formatPrice(allocation.availableAmount)})`}
                    {allocation.requestedQuantity > 0 &&
                      ` · đang yêu cầu ${allocation.requestedQuantity}`}
                    {allocation.refundedQuantity > 0 &&
                      ` · đã hoàn ${allocation.refundedQuantity}`}
                  </label>
                </div>

                {selected && draft && (
                  <div className="mt-3 space-y-3 pl-7">
                    <div>
                      <p id={`${idBase}-quantity-label`} className="text-sm">
                        Số lượng *
                      </p>
                      <Dropdown
                        disabled={isSubmitting}
                        size="sm"
                        ariaLabelledBy={`${idBase}-quantity-label`}
                        className="mt-1 w-full"
                        placeholder="Chọn số lượng"
                        options={Array.from(
                          { length: allocation.availableQuantity },
                          (_, i) => i + 1
                        ).map((n) => ({ value: n, label: String(n) }))}
                        value={draft.quantity}
                        onChange={(value) =>
                          setQuantities((current) => ({
                            ...current,
                            [allocation.allocationId]: value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <p id={`${idBase}-reason-label`} className="text-sm">
                        Lý do *
                      </p>
                      <Dropdown
                        size="sm"
                        ariaLabelledBy={`${idBase}-reason-label`}
                        disabled={isSubmitting}
                        className="mt-1 w-full"
                        placeholder="Chọn lý do"
                        options={reasons.map((reason) => ({
                          value: reason,
                          label: REFUND_REASON_LABEL[reason],
                        }))}
                        value={draft.reason}
                        onChange={(value) =>
                          setDetail(allocation.allocationId, {
                            reason: value,
                          })
                        }
                      />
                    </div>
                    <label className="block text-sm">
                      Mô tả vấn đề
                      {refundExplanationRequired(draft.reason)
                        ? " *"
                        : " (không bắt buộc)"}
                      <textarea
                        disabled={isSubmitting}
                        required={refundExplanationRequired(draft.reason)}
                        className={fieldClass}
                        rows={3}
                        maxLength={MAX_REFUND_EXPLANATION}
                        value={detail?.explanation ?? ""}
                        onChange={(event) =>
                          setDetail(allocation.allocationId, {
                            explanation: event.target.value,
                          })
                        }
                      />
                    </label>
                    {draft.reason === "missing_item" ? (
                      <p className="text-xs text-dark-400">
                        Hàng thiếu nên không cần gửi trả.
                      </p>
                    ) : (
                      <div>
                        <p id={`${idBase}-return-label`} className="text-sm">
                          Xử lý hàng *
                        </p>
                        <Dropdown
                          size="sm"
                          ariaLabelledBy={`${idBase}-return-label`}
                          disabled={isSubmitting}
                          className="mt-1 w-full"
                          placeholder="Chọn cách xử lý hàng"
                          options={[
                            { value: "return", label: "Tôi gửi trả hàng" },
                            {
                              value: "no_return",
                              label: "Tôi không gửi trả (cần ảnh bằng chứng)",
                            },
                          ]}
                          value={draft.requestedReturn}
                          onChange={(value) =>
                            setDetail(allocation.allocationId, {
                              requestedReturn: value,
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="text-sm">
                      <label htmlFor={`${idBase}-evidence`}>
                        Ảnh bằng chứng
                        {refundEvidenceRequired(draft) ? " *" : ""} (tối đa{" "}
                        {MAX_REFUND_EVIDENCE} ảnh mỗi yêu cầu,
                        JPEG/PNG/GIF/WebP, mỗi ảnh ≤ 5 MB)
                      </label>
                      <input
                        id={`${idBase}-evidence`}
                        type="file"
                        accept={EVIDENCE_MIME_TYPES.join(",")}
                        multiple
                        disabled={isSubmitting}
                        aria-required={refundEvidenceRequired(draft)}
                        className="mt-2 block w-full"
                        onChange={(event) => {
                          const files = Array.from(event.target.files ?? []);
                          event.target.value = "";
                          selectEvidence(allocation.allocationId, files);
                        }}
                      />
                      {(detail?.evidence ?? []).length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {detail?.evidence?.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex items-center gap-2"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview bypasses image optimization */}
                              <img
                                ref={(image) => {
                                  if (!image) return;
                                  const url = URL.createObjectURL(entry.file);
                                  image.src = url;
                                  return () => URL.revokeObjectURL(url);
                                }}
                                alt={`Ảnh xem trước ${entry.file.name}`}
                                className="h-20 w-20 shrink-0 rounded-lg border border-white-300 object-cover"
                              />
                              <span className="truncate">
                                {entry.file.name}
                              </span>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                className="text-xs text-dark-400 underline"
                                aria-label={`Bỏ ảnh ${entry.file.name} của ${rowLabel}`}
                                onClick={() =>
                                  removeEvidence(
                                    allocation.allocationId,
                                    entry.id
                                  )
                                }
                              >
                                Bỏ ảnh
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {uploadErrors[allocation.allocationId] && (
                        <p role="alert" className="mt-1 text-sm text-red">
                          {uploadErrors[allocation.allocationId]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {rowProblems.map((problem) => (
                  <p
                    key={problem.message}
                    role="alert"
                    className="mt-2 pl-7 text-sm text-red"
                  >
                    {problem.message}
                  </p>
                ))}
              </div>
            );
          })}
        </fieldset>
      ))}

      {requestProblems.map((problem) => (
        <p key={problem.message} role="alert" className="text-sm text-red">
          {problem.message}
        </p>
      ))}
      {notice && (
        <p role="alert" className="text-sm text-red">
          {notice}
        </p>
      )}
      <Button type="submit" size="sm" className="px-6" loading={isSubmitting}>
        Gửi yêu cầu hoàn tiền
      </Button>
    </form>
  );
}
