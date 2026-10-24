import type { RefundPolicy, RefundPolicyState } from "@/@types/Refund.type";

const MIN_WINDOW_DAYS = 1;
const MAX_WINDOW_DAYS = 365;

const isWindowDays = (value: unknown): value is number =>
  Number.isInteger(value) &&
  (value as number) >= MIN_WINDOW_DAYS &&
  (value as number) <= MAX_WINDOW_DAYS;

export const REFUND_POLICY_UNAVAILABLE_TEXT =
  "Chưa tải được chính sách hoàn tiền hiện tại. Vui lòng thử lại sau.";

/** Response /refund-policy sai shape = không tải được chính sách, không đoán thay */
export function isRefundPolicy(value: unknown): value is RefundPolicy {
  if (typeof value !== "object" || value === null) return false;
  const { enabled, windowDays, revision } = value as Record<string, unknown>;
  return (
    typeof enabled === "boolean" &&
    isWindowDays(windowDays) &&
    Number.isInteger(revision) &&
    (revision as number) >= 0
  );
}

/**
 * Chính sách chỉ đúng với điều khoản đã review khi cùng revision; khác revision thì coi như
 * chưa có chính sách khớp (đơn lưu theo điều khoản của review, không theo bản vừa tải).
 */
export function checkoutRefundPolicy(
  state: RefundPolicyState,
  reviewedRevision: number
): RefundPolicyState {
  return state.status === "ready" && state.policy.revision !== reviewedRevision
    ? { status: "unavailable" }
    : state;
}

/**
 * Câu chữ hiển thị: thời hạn tính từ lúc GIAO hàng (không có hạn chót cụ thể trước khi giao).
 * Thiếu/giao sai hàng luôn gửi được yêu cầu dù hoàn tiền thông thường đang tắt.
 */
export function refundPolicyText(input: {
  enabled: boolean;
  windowDays: number;
  productRefundEnabled: boolean;
}): { ordinary: string; claims: string } {
  if (!isWindowDays(input.windowDays)) {
    throw new RangeError(
      `Refund window must be an integer ${MIN_WINDOW_DAYS}-${MAX_WINDOW_DAYS} days, got ${input.windowDays}`
    );
  }
  const duration = `${input.windowDays} ngày kể từ khi đơn hàng được giao`;
  const ordinary = !input.enabled
    ? "Cửa hàng hiện không hỗ trợ hoàn tiền thông thường."
    : !input.productRefundEnabled
      ? "Sản phẩm này không áp dụng hoàn tiền thông thường."
      : `Hỗ trợ hoàn tiền trong ${duration}.`;
  return {
    ordinary,
    claims: `Nếu thiếu hàng hoặc nhận sai sản phẩm, bạn vẫn có thể gửi yêu cầu kèm bằng chứng trong ${duration}.`,
  };
}
