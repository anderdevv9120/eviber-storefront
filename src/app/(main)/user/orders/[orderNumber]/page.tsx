"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IOrderResponse } from "@/@types/Order.type";
import { getMyOrderDetail } from "@/apis/order";
import { ApiError } from "@/config/axios";
import Button from "@/components/ui/Button";
import { ChevronLeft } from "@/components/icons";
import { PATH } from "@/constants/paths";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { errorToast } from "@/utils/toast";
import OrderDetailView from "../_component/OrderDetailView";

const OrderDetailPage = ({ params }: { params: { orderNumber: string } }) => {
  // Next đã decode dynamic param trước khi đưa vào `params` — decode lần hai vừa thừa
  // vừa ném URIError với input hợp lệ (vd `/user/orders/ORD%25`), mà app không có error boundary
  const { orderNumber } = params;
  const [order, setOrder] = useState<IOrderResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // silent: nạp lại sau khi hủy đơn — giữ nội dung đang hiện thay vì nháy skeleton
  const fetchOrder = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      if (!options?.silent) setIsLoading(true);
      setLoadError("");
      try {
        const res = await getMyOrderDetail(orderNumber, options?.signal);
        setOrder(res.data);
      } catch (error: unknown) {
        if (options?.signal?.aborted) return;
        // Nạp lại nền (sau khi hủy đơn) mà lỗi: giữ nguyên đơn đang hiện thay vì thay cả
        // trang bằng khối lỗi. Endpoint này tắt toast global nên phải tự báo một tiếng.
        if (options?.silent) {
          errorToast(getErrorMessage(error));
          return;
        }
        // BE cố tình trả 404 chung cho "mã không tồn tại" lẫn "đơn của người khác" và
        // message gốc là tiếng Anh — nói lại bằng lời khách hiểu, đúng cả hai trường hợp
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? "Mã đơn không đúng, hoặc đơn này không thuộc tài khoản của bạn."
            : getErrorMessage(error)
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
        <div className="rounded-xl border border-white-300 bg-white p-6">
          <p className="font-semibold">Không mở được đơn hàng này</p>
          <p className="mt-1 text-sm text-dark-400">
            {loadError} — kiểm tra lại mã đơn, hoặc quay về danh sách để chọn
            đơn khác.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="px-5"
              onClick={() => fetchOrder()}
            >
              Thử lại
            </Button>
            <Link href={PATH.ORDER}>
              <Button size="sm" className="px-5">
                Về danh sách đơn
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !loadError && order && (
        <OrderDetailView
          order={order}
          onRefresh={() => fetchOrder({ silent: true })}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
