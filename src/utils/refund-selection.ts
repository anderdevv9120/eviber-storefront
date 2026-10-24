import type {
  RefundOrderAllocationView,
  RefundOrderView,
  RefundReason,
  RefundSelection,
} from "@/@types/Refund.type";
import { formatDateTime } from "@/utils/formatTime";

export const MAX_REFUND_EVIDENCE = 5;
export const MAX_REFUND_EXPLANATION = 2000;
export const WHOLE_ORDER_LABEL = "Toàn bộ đơn hàng";
export const ALL_ELIGIBLE_LABEL = "Tất cả sản phẩm đủ điều kiện";

export const REFUND_REASON_LABEL: Record<RefundReason, string> = {
  ordinary: "Hoàn tiền thông thường",
  missing_item: "Thiếu hàng",
  incorrect_item: "Nhận sai sản phẩm",
  other: "Lý do khác",
};

/** Lý do thiếu/giao sai hàng vẫn gửi được khi hoàn tiền thông thường tắt; vẫn cần còn hạn và mốc giao */
const CLAIM_REASONS: RefundReason[] = ["missing_item", "incorrect_item"];

const ordinaryAllowed = (
  view: RefundOrderView,
  allocation: RefundOrderAllocationView
) => view.eligibility.eligible && allocation.productRefundEnabled;

const claimsOpen = (view: RefundOrderView, now: number) =>
  !view.eligibility.reviewRequired &&
  view.deadline !== null &&
  now <= Date.parse(view.deadline);

/** Gợi ý theo view; BE vẫn là nơi quyết định cuối khi gửi */
export function allowedReasons(
  view: RefundOrderView,
  allocation: RefundOrderAllocationView,
  now: number
): RefundReason[] {
  if (!claimsOpen(view, now)) return [];
  return ordinaryAllowed(view, allocation)
    ? ["ordinary", ...CLAIM_REASONS, "other"]
    : CLAIM_REASONS;
}

/**
 * Dòng chọn lấy từ allocation của view (định danh gốc, không gộp theo biến thể);
 * bỏ dòng lạ/trùng/hết số dư, kẹp số lượng về số còn hoàn được.
 */
export function buildRefundSelection(
  view: RefundOrderView,
  selected: { allocationId: string; quantity: number }[]
): RefundSelection[] {
  const drafts: RefundSelection[] = [];
  for (const { allocationId, quantity } of selected) {
    const allocation = view.allocations.find(
      (entry) => entry.allocationId === allocationId
    );
    if (!allocation || drafts.some((d) => d.allocationId === allocationId))
      continue;
    const clamped = Math.min(
      Math.trunc(quantity),
      allocation.availableQuantity
    );
    if (!(clamped >= 1)) continue;
    drafts.push({
      allocationId,
      quantity: clamped,
      reason: ordinaryAllowed(view, allocation) ? "ordinary" : "missing_item",
      explanation: "",
      requestedReturn: "return",
      evidenceIds: [],
    });
  }
  return drafts;
}

/**
 * Chọn phần CÒN LẠI chưa bị giữ/đã hoàn của các dòng được hoàn thông thường.
 * "Toàn bộ đơn hàng" chỉ khi mọi số lượng còn lại đều đủ điều kiện.
 */
export function wholeOrderSelection(view: RefundOrderView) {
  const remaining = view.allocations.filter((a) => a.availableQuantity > 0);
  const eligible = remaining.filter((a) => ordinaryAllowed(view, a));
  return {
    selected: eligible.map((a) => ({
      allocationId: a.allocationId,
      quantity: a.availableQuantity,
    })),
    label:
      eligible.length === remaining.length
        ? WHOLE_ORDER_LABEL
        : ALL_ELIGIBLE_LABEL,
    excluded: remaining.filter((a) => !ordinaryAllowed(view, a)),
  };
}

export interface RefundDraftProblem {
  /** null = lỗi của cả yêu cầu, không thuộc một dòng */
  allocationId: string | null;
  message: string;
}

/** Cùng luật BE (refund.dto + refund-request.service), để chặn sớm; BE vẫn là authority */
export function refundDraftProblems(
  view: RefundOrderView,
  drafts: RefundSelection[],
  now: number
): RefundDraftProblem[] {
  if (!drafts.length) {
    return [
      {
        allocationId: null,
        message: "Chọn ít nhất một sản phẩm cần hoàn tiền",
      },
    ];
  }
  const problems: RefundDraftProblem[] = [];
  const add = (allocationId: string | null, message: string) =>
    problems.push({ allocationId, message });

  let evidenceCount = 0;
  for (const draft of drafts) {
    const allocation = view.allocations.find(
      (entry) => entry.allocationId === draft.allocationId
    );
    if (!allocation) {
      add(draft.allocationId, "Sản phẩm không thuộc đơn hàng");
      continue;
    }
    if (
      !Number.isInteger(draft.quantity) ||
      draft.quantity < 1 ||
      draft.quantity > allocation.availableQuantity
    ) {
      add(draft.allocationId, "Số lượng vượt quá số lượng còn hoàn được");
    }
    if (!allowedReasons(view, allocation, now).includes(draft.reason)) {
      add(draft.allocationId, "Lý do này không còn áp dụng cho sản phẩm");
    }
    const explanation = draft.explanation.trim();
    if (!explanation || explanation.length > MAX_REFUND_EXPLANATION) {
      add(
        draft.allocationId,
        `Mô tả cần từ 1 đến ${MAX_REFUND_EXPLANATION} ký tự`
      );
    }
    evidenceCount += draft.evidenceIds.length;
    if (
      !draft.evidenceIds.length &&
      (CLAIM_REASONS.includes(draft.reason) ||
        draft.requestedReturn === "no_return")
    ) {
      add(draft.allocationId, "Cần đính kèm ảnh bằng chứng cho yêu cầu này");
    }
  }
  if (evidenceCount > MAX_REFUND_EVIDENCE) {
    add(null, `Mỗi yêu cầu đính kèm tối đa ${MAX_REFUND_EVIDENCE} ảnh`);
  }
  return problems;
}

/** Vì sao chưa gửi được yêu cầu mới (null = còn dòng gửi được) */
export function refundBlockedMessage(
  view: RefundOrderView,
  now: number
): string | null {
  const { eligibility, deadline } = view;
  // Có điều khoản đã lưu nhưng chưa có mốc giao: chưa giao, hoặc đã giao mà cửa hàng chưa xác nhận
  if (view.policy !== null && deadline === null) {
    return "Bạn có thể gửi yêu cầu hoàn tiền sau khi đơn hàng được giao. Nếu đơn đã giao mà chưa gửi được, vui lòng liên hệ cửa hàng để xác nhận.";
  }
  if (eligibility.reviewRequired || deadline === null) {
    return (
      eligibility.reason ??
      "Đơn hàng cần được cửa hàng xác nhận trước khi gửi yêu cầu hoàn tiền"
    );
  }
  if (now > Date.parse(deadline)) {
    return `Đã quá hạn gửi yêu cầu hoàn tiền (hạn ${formatDateTime(deadline)}).`;
  }
  return view.allocations.some((a) => a.availableQuantity > 0)
    ? null
    : "Không còn sản phẩm nào có thể gửi yêu cầu hoàn tiền.";
}

/** Gom hiển thị theo sản phẩm + biến thể (giữ thứ tự xuất hiện); allocationId của từng dòng giữ nguyên */
export function groupRefundAllocations(
  allocations: RefundOrderAllocationView[]
) {
  const groups: {
    productName: string;
    variantLabel: string | null;
    allocations: RefundOrderAllocationView[];
  }[] = [];
  for (const allocation of allocations) {
    const group = groups.find(
      (entry) =>
        entry.productName === allocation.productName &&
        entry.variantLabel === allocation.variantLabel
    );
    if (group) group.allocations.push(allocation);
    else
      groups.push({
        productName: allocation.productName,
        variantLabel: allocation.variantLabel,
        allocations: [allocation],
      });
  }
  return groups;
}
