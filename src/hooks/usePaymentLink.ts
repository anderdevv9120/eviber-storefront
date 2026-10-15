"use client";

import { useCallback, useEffect, useState } from "react";
import { getPaymentLink } from "@/apis/payment";
import { ApiError } from "@/config/axios";
import { IPaymentLink } from "@/@types/Order.type";

/** `closed`: BE báo đơn không còn chờ thanh toán (đã trả / đã hủy ở nơi khác) — thử lại vô ích */
type PaymentLinkStatus = "loading" | "ready" | "expired" | "error" | "closed";

// Hai lần mount sát nhau (StrictMode dev, success → chi tiết đơn) dùng chung 1 request:
// 2 POST song song là BE tạo 2 link payOS cho cùng một đơn
const inflight = new Map<string, Promise<IPaymentLink>>();

const load = (orderNumber: string) => {
  let request = inflight.get(orderNumber);
  if (!request) {
    request = getPaymentLink(orderNumber)
      .then((res) => res.data as IPaymentLink)
      .finally(() => inflight.delete(orderNumber));
    inflight.set(orderNumber, request);
  }
  return request;
};

/** Mã QR payOS của đơn đang chờ chuyển khoản; `refresh` dùng cho cả "Tạo mã QR mới" lẫn "Thử lại" */
export const usePaymentLink = (orderNumber: string) => {
  const [link, setLink] = useState<IPaymentLink>();
  const [status, setStatus] = useState<PaymentLinkStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    // Bỏ link cũ ngay: đang tải mã mới mà còn hiện STK/nội dung của mã đã hết hạn là khách chép nhầm
    setLink(undefined);
    setStatus("loading");
    load(orderNumber)
      .then((data) => {
        if (!active) return;
        setLink(data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        const isClosed = error instanceof ApiError && error.status === 400;
        setStatus(isClosed ? "closed" : "error");
      });
    return () => {
      active = false;
    };
  }, [orderNumber, attempt]);

  // Hẹn giờ đúng mốc hết hạn thay vì chờ nhịp đồng hồ phút của trang: mã chết rồi mà còn hiện
  // thêm cả phút là khách quét vào mã payOS đã từ chối
  useEffect(() => {
    if (status !== "ready" || !link) return;
    const timer = setTimeout(
      () => setStatus("expired"),
      Math.max(link.expiresInSeconds, 0) * 1000
    );
    return () => clearTimeout(timer);
  }, [status, link]);

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  return { link, status, refresh };
};
