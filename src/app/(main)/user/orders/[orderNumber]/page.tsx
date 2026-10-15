"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IOrderResponse } from "@/@types/Order.type";
import { getMyOrderDetail } from "@/apis/order";
import { ApiError } from "@/config/axios";
import Button from "@/components/ui/Button";
import StatusScreen from "@/components/ui/StatusScreen";
import {
  CloudOfflineIllustration,
  OrderNotFoundIllustration,
} from "@/components/ui/StatusIllustrations";
import { ChevronLeft } from "@/components/icons";
import { PATH } from "@/constants/paths";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { errorToast } from "@/utils/toast";
import OrderDetailView from "../_component/OrderDetailView";

const OrderDetailPage = () => {
  // Next đã decode dynamic param trước khi đưa vào `params` — decode lần hai vừa thừa
  // vừa ném URIError với input hợp lệ (vd `/user/orders/ORD%25`), mà app không có error boundary
  const { orderNumber } = useParams<{ orderNumber: string }>();
  // Ba đường cùng ghi `order` (nạp đầu, nạp lại sau hủy, polling nền) có thể về lệch thứ tự —
  // chỉ request gửi sau cùng được ghi, không thì poll cũ đè đơn vừa hủy thành pending
  const fetchSeq = useRef(0);
  const [order, setOrder] = useState<IOrderResponse>();
  const [isLoading, setIsLoading] = useState(true);
  // notFound: BE trả 404 chung cho "mã sai" lẫn "đơn của tài khoản khác"; failed: mạng/máy chủ
  const [loadError, setLoadError] = useState<{
    kind: "notFound" | "failed";
    message: string;
  }>();

  // silent: nạp lại sau khi hủy đơn — giữ nội dung đang hiện thay vì nháy skeleton;
  // quiet: lượt polling nền lúc chờ chuyển khoản — lỗi mạng thoáng qua không được toast mỗi 5s
  const fetchOrder = useCallback(
    async (options?: {
      silent?: boolean;
      quiet?: boolean;
      signal?: AbortSignal;
    }) => {
      if (!options?.silent) setIsLoading(true);
      setLoadError(undefined);
      const seq = ++fetchSeq.current;
      try {
        const res = await getMyOrderDetail(orderNumber, options?.signal);
        if (seq !== fetchSeq.current) return;
        setOrder(res.data);
      } catch (error: unknown) {
        if (options?.signal?.aborted || seq !== fetchSeq.current) return;
        // Nạp lại nền (sau khi hủy đơn) mà lỗi: giữ nguyên đơn đang hiện thay vì thay cả
        // trang bằng khối lỗi. Endpoint này tắt toast global nên phải tự báo một tiếng.
        if (options?.silent) {
          if (!options.quiet) errorToast(getErrorMessage(error));
          return;
        }
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? { kind: "notFound", message: "" }
            : { kind: "failed", message: getErrorMessage(error) }
        );
      } finally {
        if (!options?.signal?.aborted) setIsLoading(false);
      }
    },
    [orderNumber]
  );

  useEffect(() => {
    // Đổi nhanh giữa 2 mã đơn: response cũ về sau không được đè đơn đang xem
    const controller = new AbortController();
    // Nạp dữ liệu theo mã đơn trên URL; bật skeleton trước request là chủ đích
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder({ signal: controller.signal });

    return () => controller.abort();
  }, [fetchOrder]);

  return (
    <div>
      <Link
        href={PATH.ORDER}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-dark-400 transition-colors hover:text-primary-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Đơn hàng của tôi
      </Link>

      {isLoading && (
        <div aria-busy aria-label="Đang tải chi tiết đơn">
          <div className="mb-5 h-8 w-72 animate-pulse rounded bg-white-300" />
          <div className="mb-4 h-[152px] animate-pulse rounded-xl bg-white-300" />
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-xl bg-white-300" />
            <div className="h-40 animate-pulse rounded-xl bg-white-300" />
          </div>
          <div className="h-52 animate-pulse rounded-xl bg-white-300" />
        </div>
      )}

      {!isLoading && loadError && (
        <div
          data-testid="order-load-error"
          className="flex flex-col justify-center rounded-xl border border-white-300 bg-white md:min-h-[520px]"
        >
          {loadError.kind === "notFound" ? (
            <StatusScreen
              className="py-12 md:py-16"
              illustration={<OrderNotFoundIllustration />}
              title="Không tìm thấy đơn hàng này"
              description="Mã đơn có thể gõ nhầm, hoặc đơn thuộc tài khoản khác. Mã đúng nằm trong email xác nhận đặt hàng."
              actions={
                <>
                  <Link href={PATH.ORDER} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full px-6 sm:w-auto">
                      Về danh sách đơn
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full px-6 sm:w-auto"
                    onClick={() => fetchOrder()}
                  >
                    Thử lại
                  </Button>
                </>
              }
            />
          ) : (
            // Lỗi mạng/máy chủ: đảo vai — Thử lại là việc khách cần làm, về danh sách là lối phụ
            <StatusScreen
              className="py-12 md:py-16"
              illustration={<CloudOfflineIllustration />}
              title="Không tải được đơn hàng"
              description={loadError.message}
              actions={
                <>
                  <Button
                    size="lg"
                    className="w-full px-6 sm:w-auto"
                    onClick={() => fetchOrder()}
                  >
                    Thử lại
                  </Button>
                  <Link href={PATH.ORDER} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full px-6 sm:w-auto"
                    >
                      Về danh sách đơn
                    </Button>
                  </Link>
                </>
              }
            />
          )}
        </div>
      )}

      {!isLoading && !loadError && order && (
        <OrderDetailView
          order={order}
          onRefresh={(options) =>
            fetchOrder({ silent: true, quiet: options?.quiet })
          }
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
