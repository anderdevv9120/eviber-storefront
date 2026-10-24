"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { RefundOrderView } from "@/@types/Refund.type";
import { getOrderRefunds } from "@/apis/refund";
import { ApiError } from "@/config/axios";
import Button from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatDateTime } from "@/utils/formatTime";
import { isWindowDays, refundPolicyText } from "@/utils/refund-policy";
import RefundHistory from "./RefundHistory";
import RefundRequestForm from "./RefundRequestForm";

interface RefundPanelProps {
  orderNumber: string;
  /** Phiên khách đã xác thực; khách đăng nhập chính chủ không truyền. Đổi đơn/phiên → mount lại bằng `key` */
  sessionToken?: string;
  /** BE từ chối phiên khách (401: hết hạn/không hợp lệ) — cha xóa phiên của đơn này và mời xin link mới */
  onSessionRejected?: () => void;
}

/** Revision tăng đơn điệu: phản hồi cũ về muộn không được đè view đã commit mới hơn */
const newest = (current: RefundOrderView | undefined, next: RefundOrderView) =>
  current && current.revision > next.revision ? current : next;

export default function RefundPanel({
  orderNumber,
  sessionToken,
  onSessionRejected,
}: RefundPanelProps) {
  const [view, setView] = useState<RefundOrderView>();
  const [loadError, setLoadError] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  // Callback của cha đổi identity mỗi render nhưng không được kéo effect fetch chạy lại
  const rejectSession = useEffectEvent(() => onSessionRejected?.());

  // Effect chỉ đồng bộ network: lấy view, hủy khi đổi đơn/phiên hoặc tải lại
  useEffect(() => {
    const controller = new AbortController();
    getOrderRefunds(orderNumber, { signal: controller.signal, sessionToken })
      .then((response) => {
        if (controller.signal.aborted) return;
        setView((current) => newest(current, response.data));
        setLoadError(undefined);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (sessionToken && error instanceof ApiError && error.status === 401) {
          rejectSession();
          return;
        }
        setLoadError(getErrorMessage(error));
      });
    return () => controller.abort();
  }, [orderNumber, sessionToken, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const policyText =
    view?.policy && isWindowDays(view.policy.windowDays)
      ? refundPolicyText({ ...view.policy, productRefundEnabled: true })
      : null;

  return (
    <section
      aria-labelledby="refund-panel-title"
      className="mt-4 overflow-hidden rounded-xl border border-white-300 bg-white"
    >
      <header className="border-b border-white-300 bg-white-50 px-4 py-3 sm:px-5">
        <h2 id="refund-panel-title" className="text-sm font-bold">
          Hoàn tiền
        </h2>
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        {!view && !loadError && (
          <p role="status" className="text-sm text-dark-400">
            Đang tải thông tin hoàn tiền…
          </p>
        )}
        {loadError && (
          <div role="alert" className="space-y-2 text-sm">
            <p className="text-red">
              {view
                ? `Chưa cập nhật được thông tin hoàn tiền: ${loadError}`
                : `Không tải được thông tin hoàn tiền: ${loadError}`}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="px-4"
              onClick={() => {
                setLoadError(undefined);
                reload();
              }}
            >
              Thử lại
            </Button>
          </div>
        )}
        {view && (
          <>
            <div className="space-y-1 text-sm text-dark-500">
              {policyText ? (
                <>
                  <p>{policyText.ordinary}</p>
                  <p>{policyText.claims}</p>
                </>
              ) : (
                <p>Đơn hàng này chưa có điều khoản hoàn tiền được lưu.</p>
              )}
              {view.deadline ? (
                <p className="font-medium text-dark-700">
                  Hạn gửi yêu cầu: {formatDateTime(view.deadline)}
                </p>
              ) : (
                policyText && (
                  <p>Hạn gửi yêu cầu được tính từ khi đơn hàng được giao.</p>
                )
              )}
            </div>
            {view.allocations.length === 0 && view.requests.length === 0 ? (
              <p className="text-sm text-dark-400">
                Đơn hàng này chưa có sản phẩm nào để gửi yêu cầu hoàn tiền.
              </p>
            ) : (
              <RefundRequestForm
                key={view.orderId}
                view={view}
                sessionToken={sessionToken}
                onViewChange={(next) =>
                  setView((current) => newest(current, next))
                }
                onReload={reload}
              />
            )}
            <RefundHistory view={view} sessionToken={sessionToken} />
          </>
        )}
      </div>
    </section>
  );
}
