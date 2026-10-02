import { IOrderResponse } from "@/@types/Order.type";

export type BankTransferState = "awaiting" | "paid" | "expired" | "cancelled";

/**
 * Trạng thái khối chuyển khoản, suy từ đơn (không có trạng thái riêng ở BE):
 * - cancelled: đơn đã hủy (kể cả khi paid — tiền về muộn vẫn hiện màn đã hủy);
 *   `expired` khi hủy vì quá hạn (đã qua paymentDueAt), `cancelled` khi hủy trước hạn.
 * - paid: đã nhận tiền.
 * - expired: qua hạn mà job auto-hủy chưa quét — FE tự tính để không hiện QR cho đơn sắp hủy.
 * - awaiting: còn hạn (hoặc đơn cũ không có hạn) → hiện QR + STK.
 * Đơn không phải chuyển khoản → null.
 */
export function getBankTransferState(
  order: Pick<
    IOrderResponse,
    | "paymentInfo"
    | "paymentStatus"
    | "status"
    | "paymentDueAt"
    | "statusHistory"
    | "updated_at"
  >,
  now: Date = new Date()
): BankTransferState | null {
  if (order.paymentInfo?.method !== "BANK_TRANSFER") return null;

  const dueMs = order.paymentDueAt
    ? new Date(order.paymentDueAt).getTime()
    : undefined;

  if (order.status === "cancelled") {
    // "Hết hạn" là hủy SAU mốc hạn — so mốc hủy (không phải giờ xem) để đơn khách tự hủy
    // giờ thứ 1 mở lại hôm sau không bị gán "quá hạn thanh toán"
    const cancelledAt = getCancelledAt(order);
    return dueMs !== undefined && cancelledAt >= dueMs
      ? "expired"
      : "cancelled";
  }
  if (order.paymentStatus === "paid") return "paid";
  if (dueMs !== undefined && dueMs <= now.getTime()) return "expired";
  return "awaiting";
}

// Public lookup vẫn có statusHistory {status, changedAt}; đơn đời cũ mảng rỗng → rơi về updated_at
function getCancelledAt(
  order: Pick<IOrderResponse, "statusHistory" | "updated_at">
): number {
  const entry = [...(order.statusHistory ?? [])]
    .reverse()
    .find((e) => e.status === "cancelled");
  return new Date(entry?.changedAt ?? order.updated_at).getTime();
}

/** "Còn 23 giờ 40 phút" / "Còn 12 phút" / "Còn dưới 1 phút" — chip hạn trên khối chuyển khoản */
export function formatTimeLeft(dueAt: string, now: Date = new Date()): string {
  const diffMs = new Date(dueAt).getTime() - now.getTime();
  if (diffMs <= 0) return "Đã hết hạn";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 48) return `Còn ${Math.floor(hours / 24)} ngày`;
  if (hours > 0) return `Còn ${hours} giờ ${minutes} phút`;
  if (minutes > 0) return `Còn ${minutes} phút`;
  return "Còn dưới 1 phút";
}

const VIETQR_IMAGE_BASE = "https://img.vietqr.io/image";

/**
 * Quick-link ảnh VietQR (NAPAS 247): app ngân hàng quét xong tự điền số tiền + nội dung.
 * Cùng công thức với BE (ảnh trong email) — sửa một bên phải sửa bên kia.
 */
export function buildVietQrImageUrl(input: {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  amount?: number;
  addInfo?: string;
}): string {
  const params = new URLSearchParams();
  if (input.amount && input.amount > 0)
    params.set("amount", String(Math.round(input.amount)));
  if (input.addInfo) params.set("addInfo", input.addInfo);
  if (input.accountName) params.set("accountName", input.accountName);
  const query = params.toString();
  return `${VIETQR_IMAGE_BASE}/${encodeURIComponent(input.bankBin)}-${encodeURIComponent(input.accountNumber)}-compact2.png${query ? `?${query}` : ""}`;
}
