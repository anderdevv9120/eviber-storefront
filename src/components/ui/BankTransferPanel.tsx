"use client";

import { useEffect, useEffectEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check } from "@/components/icons";
import { cn } from "@/config/utils";
import {
  BANK_NAME_BY_BIN,
  BANK_TRANSFER_POLLING,
  PAYMENT_METHOD_LABEL,
} from "@/constants/payment";
import { usePaymentLink } from "@/hooks/usePaymentLink";
import { formatPrice } from "@/utils/formatPrice";
import { formatTimeDayMonth } from "@/utils/formatTime";
import { BankTransferState, formatTimeLeft } from "@/utils/bankTransfer";
import Button from "./Button";
import CopyButton from "./CopyButton";

interface BankTransferPanelProps {
  state: BankTransferState;
  orderNumber: string;
  /** Đồng hồ của trang bọc ngoài — chip hạn và state awaiting/expired phải cùng một mốc */
  now: Date;
  paymentDueAt?: string;
  paidAt?: string;
  /** Đơn đã đóng: paid/refunded đổi lời chip (tiền về muộn vẫn hiện màn đã hủy nhưng phải nói đã nhận) */
  paymentStatus?: string;
  /** Eyebrow "Thanh toán" — success + chi tiết đơn đặt tiêu đề khác nhau nên nhận từ ngoài */
  eyebrow?: string;
  /** Mã QR đang sống hay không — trang bọc ngoài polling đơn theo đúng vòng đời mã (hết hạn/lỗi thì nghỉ) */
  onQrActiveChange?: (active: boolean) => void;
}

const QR_SIZE = 132;
const CHIP =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold";

/**
 * Khối chuyển khoản dùng chung cho /payment-success và chi tiết đơn.
 * Vỏ (nền Pine-50 tràn mép / card) do trang bọc ngoài.
 */
export default function BankTransferPanel({
  state,
  orderNumber,
  now,
  paymentDueAt,
  paidAt,
  paymentStatus,
  eyebrow = "Thanh toán",
  onQrActiveChange,
}: BankTransferPanelProps) {
  const methodLabel = PAYMENT_METHOD_LABEL.BANK_TRANSFER;

  if (state === "paid") {
    return (
      <div
        data-testid="bank-transfer-paid"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
            {eyebrow}
          </p>
          <p className="mt-1 font-semibold">{methodLabel}</p>
        </div>
        <span className={cn(CHIP, "bg-primary-50 text-primary-700")}>
          <Check className="h-3.5 w-3.5" />
          Đã thanh toán{paidAt ? ` · ${formatTimeDayMonth(paidAt)}` : ""}
        </span>
      </div>
    );
  }

  if (state === "expired" || state === "cancelled") {
    return (
      <div data-testid="bank-transfer-closed">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
              {eyebrow}
            </p>
            <p className="mt-1 font-semibold">{methodLabel}</p>
          </div>
          <span className={cn(CHIP, "bg-terracotta/10 text-terracotta")}>
            {closedChipLabel(state, paymentStatus, paymentDueAt)}
          </span>
        </div>
        {paymentStatus !== "refunded" && (
          <p className="mt-3 text-sm text-dark-500">
            {paymentStatus === "paid" ? (
              <>
                <b className="font-semibold text-dark-800">
                  Shop đã nhận tiền sau khi đơn hủy
                </b>{" "}
                và sẽ liên hệ để hoàn lại. Cần gấp, liên hệ shop kèm mã đơn.
              </>
            ) : (
              <>
                <b className="font-semibold text-dark-800">Đã lỡ chuyển rồi?</b>{" "}
                Liên hệ shop kèm mã đơn để hoàn tiền hoặc nối lại đơn.
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <AwaitingPanel
      orderNumber={orderNumber}
      now={now}
      paymentDueAt={paymentDueAt}
      eyebrow={eyebrow}
      onQrActiveChange={onQrActiveChange}
    />
  );
}

function closedChipLabel(
  state: BankTransferState,
  paymentStatus?: string,
  paymentDueAt?: string
) {
  if (paymentStatus === "refunded") return "Đã hoàn tiền";
  if (paymentStatus === "paid") return "Đã nhận · chờ hoàn tiền";
  return state === "expired" && paymentDueAt
    ? `Chưa nhận · hết hạn ${formatTimeDayMonth(paymentDueAt)}`
    : "Chưa nhận · đơn đã hủy";
}

function AwaitingPanel({
  orderNumber,
  now,
  paymentDueAt,
  eyebrow,
  onQrActiveChange,
}: Omit<BankTransferPanelProps, "state" | "paidAt">) {
  const { link, status, refresh } = usePaymentLink(orderNumber);
  // Effect event để effect chỉ chạy theo `status`: cha truyền arrow inline mà effect
  // phụ thuộc identity là grace timer bị reset mỗi lần cha re-render (mỗi lượt poll)
  const notify = useEffectEvent((active: boolean) =>
    onQrActiveChange?.(active)
  );
  // "loading" cũng tính là sống: mã mới đang tải mà tiền của mã cũ vừa về thì vẫn phải bắt được
  useEffect(() => {
    notify(status === "ready" || status === "loading" || status === "expired");
    const grace =
      status === "expired"
        ? setTimeout(() => notify(false), BANK_TRANSFER_POLLING.expiredGraceMs)
        : undefined;
    return () => {
      clearTimeout(grace);
      notify(false);
    };
  }, [status]);
  // Hết hạn → "Đã hết hạn" cho tới khi cha đổi state (không tự ẩn để khách hiểu vì sao QR sắp mất tác dụng)
  const timeLeft = paymentDueAt ? formatTimeLeft(paymentDueAt, now) : undefined;
  const isLoading = status === "loading";
  // Link hết hạn đúng mốc hạn đơn: bấm "Tạo mã QR mới" là BE 400 → `closed`, không cần đoán trước ở đây
  const notice = getLinkNotice(status, orderNumber, refresh);

  return (
    <div data-testid="bank-transfer-guide">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-700">
            {eyebrow}
          </p>
          <p className="mt-1 font-bold text-primary-800">
            Quét QR hoặc chuyển khoản theo thông tin
          </p>
        </div>
        {timeLeft && (
          <span
            data-testid="bank-transfer-due"
            className={cn(
              CHIP,
              "bg-white text-primary-700 ring-1 ring-primary-200"
            )}
          >
            {timeLeft}
          </span>
        )}
      </div>
      {notice ? (
        <div
          data-testid={`payment-link-${status}`}
          className="mt-3 flex flex-wrap items-center justify-between gap-4"
        >
          <p className="text-sm text-dark-500">
            <b className="font-semibold text-dark-800">{notice.title}</b>{" "}
            {notice.detail}
          </p>
          <Button data-testid="payment-link-refresh" onClick={notice.onAction}>
            {notice.action}
          </Button>
        </div>
      ) : (
        <div className="mt-1 flex flex-wrap items-start gap-4">
          <p className="w-full text-sm text-dark-500">
            Chuyển tay thì nhập đúng số tiền và nội dung bên dưới. Trang tự cập
            nhật khi shop nhận được tiền, bạn không cần làm gì thêm.
          </p>
          <dl className="flex min-w-[240px] flex-1 flex-col gap-2.5 text-sm">
            {(isLoading || (link && BANK_NAME_BY_BIN[link.bankBin])) && (
              <BankRow
                label="Ngân hàng"
                value={link && BANK_NAME_BY_BIN[link.bankBin]}
              />
            )}
            <BankRow
              label="Số tài khoản"
              value={link?.accountNumber}
              isTabular
              copyTestId="copy-account-number"
            />
            <BankRow label="Chủ tài khoản" value={link?.accountName} />
            <BankRow label="Số tiền" value={link && formatPrice(link.amount)} />
            <BankRow
              label="Nội dung"
              value={link?.description}
              isTabular
              copyTestId="copy-transfer-content"
            />
          </dl>

          <div className="flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-white p-1.5">
            {link && !isLoading ? (
              <QRCodeSVG
                data-testid="bank-transfer-qr"
                value={link.qrCode}
                size={QR_SIZE - 14}
                level="M"
                title={`Mã QR chuyển khoản ${formatPrice(link.amount)} cho đơn ${orderNumber}`}
              />
            ) : (
              <span className="h-full w-full animate-pulse rounded bg-white-300" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Trạng thái không có mã QR để hiện: một dòng giải thích + đúng một việc khách làm được */
function getLinkNotice(
  status: ReturnType<typeof usePaymentLink>["status"],
  orderNumber: string,
  refresh: () => void
) {
  switch (status) {
    case "expired":
      return {
        title: "Mã QR đã hết hạn.",
        detail: "Đơn vẫn được giữ, tạo mã mới để thanh toán.",
        action: "Tạo mã QR mới",
        onAction: refresh,
      };
    case "error":
      return {
        title: "Chưa tạo được mã QR.",
        detail: `Thử lại sau ít phút, hoặc liên hệ shop kèm mã đơn ${orderNumber}.`,
        action: "Thử lại",
        onAction: refresh,
      };
    case "unavailable":
      return {
        title: "Shop tạm ngưng nhận chuyển khoản.",
        detail: `Đơn vẫn được giữ — liên hệ shop kèm mã đơn ${orderNumber} để được hướng dẫn thanh toán.`,
        action: "Thử lại",
        onAction: refresh,
      };
    case "closed":
      return {
        title: "Đơn này không còn chờ thanh toán.",
        detail: "Tải lại trang để xem trạng thái mới nhất của đơn.",
        action: "Tải lại trang",
        onAction: () => window.location.reload(),
      };
    default:
      return null;
  }
}

function BankRow({
  label,
  value,
  isTabular,
  copyTestId,
}: {
  label: string;
  value?: string;
  isTabular?: boolean;
  copyTestId?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-dark-500">{label}</dt>
      <dd className="m-0 flex items-center gap-2 text-right font-bold">
        {value ? (
          <span className={cn(isTabular && "tabular-nums tracking-wide")}>
            {value}
          </span>
        ) : (
          <span className="inline-block h-4 w-28 animate-pulse rounded bg-white-300" />
        )}
        {copyTestId && value && (
          <CopyButton
            value={value}
            label="Sao chép"
            copiedLabel="Đã chép"
            testId={copyTestId}
            className="px-2 py-1"
          />
        )}
      </dd>
    </div>
  );
}
