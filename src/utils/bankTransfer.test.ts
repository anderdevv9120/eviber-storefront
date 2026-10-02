import { describe, expect, it } from "vitest";
import {
  buildVietQrImageUrl,
  formatTimeLeft,
  getBankTransferState,
} from "./bankTransfer";

const NOW = new Date("2026-09-22T10:00:00.000Z");
const HOUR = 60 * 60 * 1000;
const iso = (offsetMs: number) =>
  new Date(NOW.getTime() + offsetMs).toISOString();

const bankOrder = (
  overrides: Partial<Parameters<typeof getBankTransferState>[0]> = {}
) => ({
  paymentInfo: { method: "BANK_TRANSFER" },
  paymentStatus: "unpaid" as const,
  status: "pending" as const,
  paymentDueAt: iso(HOUR),
  statusHistory: [],
  updated_at: iso(0),
  ...overrides,
});
const cancelledAt = (offsetMs: number) => [
  {
    status: "pending" as const,
    changedAt: iso(-24 * HOUR),
    changedBy: { actorType: "customer" as const },
  },
  {
    status: "cancelled" as const,
    changedAt: iso(offsetMs),
    changedBy: { actorType: "customer" as const },
  },
];

describe("getBankTransferState", () => {
  it("đơn COD → null", () => {
    expect(
      getBankTransferState(bankOrder({ paymentInfo: { method: "CASH" } }), NOW)
    ).toBeNull();
  });

  it("còn hạn + unpaid → awaiting; đơn cũ không có hạn cũng awaiting", () => {
    expect(getBankTransferState(bankOrder(), NOW)).toBe("awaiting");
    expect(
      getBankTransferState(bankOrder({ paymentDueAt: undefined }), NOW)
    ).toBe("awaiting");
  });

  it("paid → paid, kể cả đã quá hạn (đã trả thì hạn không còn nghĩa)", () => {
    expect(
      getBankTransferState(bankOrder({ paymentStatus: "paid" }), NOW)
    ).toBe("paid");
    expect(
      getBankTransferState(
        bankOrder({ paymentStatus: "paid", paymentDueAt: iso(-HOUR) }),
        NOW
      )
    ).toBe("paid");
  });

  it("quá hạn mà job chưa quét (status còn pending) → expired", () => {
    expect(
      getBankTransferState(bankOrder({ paymentDueAt: iso(-1) }), NOW)
    ).toBe("expired");
  });

  it("đơn cancelled: hủy SAU hạn → expired, hủy trước hạn → cancelled kể cả xem sau hạn; paid trên đơn cancelled vẫn là đã hủy", () => {
    // job hủy lúc dueAt (đơn đã quá hạn) → expired
    expect(
      getBankTransferState(
        bankOrder({
          status: "cancelled",
          paymentDueAt: iso(-HOUR),
          statusHistory: cancelledAt(-HOUR + 60_000),
        }),
        NOW
      )
    ).toBe("expired");
    // khách hủy giờ thứ 1, xem lại sau khi mốc hạn đã qua → vẫn cancelled
    expect(
      getBankTransferState(
        bankOrder({
          status: "cancelled",
          paymentDueAt: iso(-HOUR),
          statusHistory: cancelledAt(-20 * HOUR),
        }),
        NOW
      )
    ).toBe("cancelled");
    // không có history (đơn cũ) → dùng updated_at
    expect(
      getBankTransferState(
        bankOrder({ status: "cancelled", updated_at: iso(-30 * HOUR) }),
        NOW
      )
    ).toBe("cancelled");
    expect(
      getBankTransferState(
        bankOrder({
          status: "cancelled",
          paymentStatus: "paid",
          paymentDueAt: iso(-HOUR),
          statusHistory: cancelledAt(-HOUR + 1),
        }),
        NOW
      )
    ).toBe("expired");
  });

  it("paymentStatus failed trên đơn pending → awaiting (chưa có luồng set failed, ghim cho payos-gateway)", () => {
    expect(
      getBankTransferState(bankOrder({ paymentStatus: "failed" }), NOW)
    ).toBe("awaiting");
  });
});

describe("formatTimeLeft", () => {
  it("giờ + phút / chỉ phút / dưới 1 phút / hết hạn", () => {
    expect(formatTimeLeft(iso(23 * HOUR + 40 * 60_000 + 30_000), NOW)).toBe(
      "Còn 23 giờ 40 phút"
    );
    expect(formatTimeLeft(iso(12 * 60_000), NOW)).toBe("Còn 12 phút");
    expect(formatTimeLeft(iso(30_000), NOW)).toBe("Còn dưới 1 phút");
    expect(formatTimeLeft(iso(0), NOW)).toBe("Đã hết hạn");
    expect(formatTimeLeft(iso(49 * HOUR), NOW)).toBe("Còn 2 ngày");
  });
});

describe("buildVietQrImageUrl", () => {
  it("ghép bankBin-STK vào path, amount/addInfo/accountName vào query", () => {
    const url = new URL(
      buildVietQrImageUrl({
        bankBin: "970436",
        accountNumber: "0071000123456",
        accountName: "NGUYEN VAN A",
        amount: 399000,
        addInfo: "ORD-K7WQ3FZ8HXME2NRT",
      })
    );
    expect(url.origin + url.pathname).toBe(
      "https://img.vietqr.io/image/970436-0071000123456-compact2.png"
    );
    expect(url.searchParams.get("amount")).toBe("399000");
    expect(url.searchParams.get("addInfo")).toBe("ORD-K7WQ3FZ8HXME2NRT");
    expect(url.searchParams.get("accountName")).toBe("NGUYEN VAN A");
  });
});
