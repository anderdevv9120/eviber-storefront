"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { RefundGuestSession } from "@/@types/Refund.type";
import { requestRefundAccess, verifyRefundAccess } from "@/apis/refund";
import Button from "@/components/ui/Button";
import { ApiError } from "@/config/axios";
import { PATH } from "@/constants/paths";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  clearRefundGuestSession,
  readRefundGuestSession,
  saveRefundGuestSession,
} from "@/utils/refund-guest-session";
import RefundPanel from "./RefundPanel";

// Cố định thay vì phản chiếu thân 202 của BE: không bao giờ nói link có thật sự được gửi hay không
const LINK_REQUESTED_TEXT =
  "Nếu đơn hàng này đủ điều kiện, shop đã gửi liên kết xác thực (có hiệu lực 15 phút) tới email dùng khi đặt hàng. Hãy kiểm tra cả hộp thư rác.";

const LINK_REJECTED_STATUSES = [400, 401, 404];

/** Token nằm ở fragment `#token=` — không bao giờ tới server/Referer/log */
const readLinkToken = () =>
  new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";

function GuestRefundAccessContent() {
  const orderNumber = useSearchParams().get("orderNumber") ?? "";

  // undefined = chưa đọc sessionStorage (server render không có nó)
  const [session, setSession] = useState<RefundGuestSession | null>();
  const [notice, setNotice] = useState<string>();
  const [hasLinkToken, setHasLinkToken] = useState(false);
  const linkToken = useRef("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string>();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestResult, setRequestResult] = useState<{
    ok: boolean;
    text: string;
  }>();

  // Effect chỉ đồng bộ trạng thái trình duyệt: phiên đã lưu của đơn này (mở lại cùng tab vẫn còn)
  useEffect(() => {
    setSession(readRefundGuestSession(orderNumber, Date.now()));
  }, [orderNumber]);

  // Chỉ giữ token link trong bộ nhớ và gỡ khỏi thanh địa chỉ/history ngay; không lưu ở đâu cả.
  // Lần chạy thứ hai (StrictMode) thấy fragment đã trống nên không ghi đè token đã bắt được.
  useEffect(() => {
    const token = readLinkToken();
    if (!token) return;
    linkToken.current = token;
    setHasLinkToken(true);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }, []);

  // Đổi link lấy phiên chỉ khi khách bấm — render/prefetch không được tiêu thụ link một lần
  const verify = async () => {
    const token = linkToken.current;
    if (!token || isVerifying) return;
    setIsVerifying(true);
    setVerifyError(undefined);
    try {
      const { data } = await verifyRefundAccess(orderNumber, token);
      linkToken.current = "";
      setHasLinkToken(false);
      saveRefundGuestSession(orderNumber, data);
      setNotice(undefined);
      setSession(data);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      if (status !== undefined && LINK_REJECTED_STATUSES.includes(status)) {
        // Link hết hạn/đã dùng/sai đơn: bỏ token, chỉ còn lối xin link mới
        linkToken.current = "";
        setHasLinkToken(false);
        setVerifyError(
          "Liên kết không còn hiệu lực (đã hết hạn, đã dùng hoặc không thuộc đơn này). Hãy gửi liên kết mới tới email đặt hàng."
        );
      } else {
        setVerifyError(getErrorMessage(error));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const requestLink = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setRequestResult(undefined);
    try {
      await requestRefundAccess(orderNumber);
      setRequestResult({ ok: true, text: LINK_REQUESTED_TEXT });
    } catch (error) {
      setRequestResult({ ok: false, text: getErrorMessage(error) });
    } finally {
      setIsRequesting(false);
    }
  };

  // BE từ chối phiên (hết hạn/không hợp lệ): xóa riêng phiên của đơn này, mời xin link mới
  const endSession = () => {
    clearRefundGuestSession(orderNumber);
    setSession(null);
    setRequestResult(undefined);
    setNotice(
      "Phiên truy cập đã hết hạn. Hãy gửi liên kết xác thực mới tới email đặt hàng."
    );
  };

  if (!orderNumber) {
    return (
      <Card title="Thiếu mã đơn hàng">
        <p className="text-sm text-dark-500">
          Liên kết không có mã đơn hàng. Hãy mở lại liên kết trong email hoặc
          vào từ trang đơn hàng của bạn.
        </p>
        <Link
          href={PATH.HOME}
          className="inline-block rounded text-sm font-semibold text-primary-700 hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
        >
          Về trang chủ
        </Link>
      </Card>
    );
  }

  if (session === undefined) return <GuestRefundAccessSkeleton />;

  if (session) {
    return (
      <div>
        <h1 className="text-xl font-extrabold md:text-2xl">
          Hoàn tiền đơn {orderNumber}
        </h1>
        <RefundPanel
          key={session.sessionToken}
          orderNumber={orderNumber}
          sessionToken={session.sessionToken}
          onSessionRejected={endSession}
        />
      </div>
    );
  }

  return (
    <Card title={`Yêu cầu hoàn tiền cho đơn ${orderNumber}`}>
      <p className="text-sm text-dark-500">
        Để bảo vệ thông tin đơn hàng, shop cần xác nhận bạn là người đặt hàng
        qua email dùng khi đặt. Biết mã đơn hàng là chưa đủ để xem hoặc gửi yêu
        cầu hoàn tiền.
      </p>
      {notice && (
        <p role="status" className="text-sm font-medium text-dark-700">
          {notice}
        </p>
      )}
      {hasLinkToken && (
        <div className="space-y-2 rounded-lg bg-white-50 p-4">
          <p className="text-sm text-dark-700">
            Bạn đã mở liên kết xác thực từ email. Bấm xác nhận để mở quyền truy
            cập trong 24 giờ trên trình duyệt này.
          </p>
          <Button
            type="button"
            size="md"
            loading={isVerifying}
            onClick={verify}
            data-testid="refund-access-verify"
          >
            Xác nhận truy cập
          </Button>
        </div>
      )}
      {verifyError && (
        <p role="alert" className="text-sm text-red">
          {verifyError}
        </p>
      )}
      <div className="space-y-2">
        <Button
          type="button"
          size="md"
          variant={hasLinkToken ? "ghost" : "outline"}
          loading={isRequesting}
          onClick={requestLink}
          data-testid="refund-access-request"
        >
          Gửi liên kết xác thực tới email đặt hàng
        </Button>
        {requestResult && (
          <p
            role={requestResult.ok ? "status" : "alert"}
            className={
              requestResult.ok ? "text-sm text-dark-700" : "text-sm text-red"
            }
          >
            {requestResult.text}
          </p>
        )}
      </div>
    </Card>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[560px] space-y-4 rounded-xl border border-white-200 bg-white px-6 py-8 shadow-card">
      <h1 className="text-xl font-extrabold">{title}</h1>
      {children}
    </div>
  );
}

function GuestRefundAccessSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang kiểm tra phiên truy cập"
      className="mx-auto h-56 w-full max-w-[560px] animate-pulse rounded-xl bg-white-300"
    />
  );
}

export default function GuestRefundAccess() {
  return (
    <Suspense fallback={<GuestRefundAccessSkeleton />}>
      <GuestRefundAccessContent />
    </Suspense>
  );
}
