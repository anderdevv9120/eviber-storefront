"use client";

import { useEffect, useEffectEvent } from "react";
import { BANK_TRANSFER_POLLING } from "@/constants/payment";

/**
 * Hỏi lại BE theo nhịp cố định chừng nào `enabled` (màn chờ chuyển khoản đang hiện mã QR).
 * Lượt trước chưa về thì bỏ lượt sau nên các lượt poll về đúng thứ tự; caller có thêm đường fetch
 * khác ghi cùng state (nạp lại sau hủy đơn...) phải tự chống ghi đè bằng sequence.
 * Tab ẩn thì nghỉ hẳn: không tiêu quota throttle lookup (tính theo IP, hai tab cùng đơn là chạm trần)
 * và quay lại tab là hỏi ngay thay vì chờ hết nhịp.
 */
export const usePaymentPolling = (
  enabled: boolean,
  poll: () => Promise<void>
) => {
  const onPoll = useEffectEvent(poll);

  useEffect(() => {
    if (!enabled) return;
    let inFlight = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        await onPoll();
      } catch {
        // làm mới nền, không phải thao tác của khách — lần sau thử lại
      } finally {
        inFlight = false;
      }
    };
    const start = () => {
      if (timer) return;
      timer = setInterval(tick, BANK_TRANSFER_POLLING.intervalMs);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      void tick();
      start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);
};
