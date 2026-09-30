"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "@/components/icons";
import { cn } from "@/config/utils";
import { PAYMENT_METHOD_LABEL } from "@/constants/payment";
import { useBankTransferAccount } from "@/hooks/useBankTransferAccount";
import { formatPrice } from "@/utils/formatPrice";
import { formatTimeDayMonth } from "@/utils/formatTime";
import {
  BankTransferState,
  buildVietQrImageUrl,
  formatTimeLeft,
} from "@/utils/bankTransfer";
import CopyButton from "./CopyButton";

interface BankTransferPanelProps {
  state: BankTransferState;
  orderNumber: string;
  totalPrice: number;
  /** Đồng hồ của trang bọc ngoài — chip hạn và state awaiting/expired phải cùng một mốc */
  now: Date;
  paymentDueAt?: string;
  paidAt?: string;
  /** Đơn đã đóng: paid/refunded đổi lời chip (tiền về muộn vẫn hiện màn đã hủy nhưng phải nói đã nhận) */
  paymentStatus?: string;
  /** Eyebrow "Thanh toán" — success + chi tiết đơn đặt tiêu đề khác nhau nên nhận từ ngoài */
  eyebrow?: string;
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
  totalPrice,
  now,
  paymentDueAt,
  paidAt,
  paymentStatus,
  eyebrow = "Thanh toán",
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
      totalPrice={totalPrice}
      now={now}
      paymentDueAt={paymentDueAt}
      eyebrow={eyebrow}
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
  totalPrice,
  now,
  paymentDueAt,
  eyebrow,
}: Omit<BankTransferPanelProps, "state" | "paidAt">) {
  const { account, error } = useBankTransferAccount();
  const [qrFailed, setQrFailed] = useState(false);
  // Hết hạn → "Đã hết hạn" cho tới khi cha đổi state (không tự ẩn để khách hiểu vì sao QR sắp mất tác dụng)
  const timeLeft = paymentDueAt ? formatTimeLeft(paymentDueAt, now) : undefined;

  const qrUrl = account
    ? buildVietQrImageUrl({
        bankBin: account.bankBin,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: totalPrice,
        addInfo: orderNumber,
      })
    : undefined;

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
      <p className="mb-4 mt-1 text-sm text-dark-500">
        Nội dung chuyển khoản phải đúng mã đơn để shop đối soát. Đã chuyển thì
        không cần làm gì thêm, shop xác nhận trong giờ làm việc.
      </p>

      {error ? (
        <p className="text-sm text-dark-500">
          Chưa tải được thông tin tài khoản nhận. Tải lại trang, hoặc liên hệ
          shop kèm mã đơn{" "}
          <b className="font-semibold text-dark-800">{orderNumber}</b> để nhận
          số tài khoản.
        </p>
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          <dl className="flex min-w-[240px] flex-1 flex-col gap-2.5 text-sm">
            <BankRow label="Ngân hàng" value={account?.bankName} />
            <BankRow
              label="Số tài khoản"
              value={account?.accountNumber}
              isTabular
              copyTestId="copy-account-number"
            />
            <BankRow label="Chủ tài khoản" value={account?.accountName} />
            <BankRow label="Số tiền" value={formatPrice(totalPrice)} />
            <BankRow
              label="Nội dung"
              value={orderNumber}
              isTabular
              copyTestId="copy-transfer-content"
            />
          </dl>

          {qrUrl && !qrFailed && (
            <Image
              data-testid="bank-transfer-qr"
              src={qrUrl}
              alt={`Mã QR chuyển khoản ${formatPrice(totalPrice)} cho đơn ${orderNumber}`}
              width={QR_SIZE}
              height={QR_SIZE}
              unoptimized
              onError={() => setQrFailed(true)}
              className="h-[132px] w-[132px] shrink-0 rounded-lg border border-primary-200 bg-white p-1.5"
            />
          )}
        </div>
      )}
    </div>
  );
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
