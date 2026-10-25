"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getOrders } from "@/apis/order";
import { IOrderResponse } from "@/@types/Order.type";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { PackageBox } from "@/components/icons";
import { PATH } from "@/constants/paths";
import {
  ORDER_PAGE_SIZE,
  ORDER_TABS,
  OrderStatus,
} from "@/constants/orderStatus";
import { getErrorMessage } from "@/utils/getErrorMessage";
import useIgnoreFirstEffect from "@/hooks/useIgnoreFirstEffect";
import OrderCard from "./OrderCard";

interface OrderListProps {
  status?: OrderStatus;
  search?: string;
}

const OrderList = ({ status, search }: OrderListProps) => {
  const [orders, setOrders] = useState<IOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useIgnoreFirstEffect(() => {
    if (page !== 1) setPage(1);
  }, [status, search]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await getOrders(
          { search, page, pageSize: ORDER_PAGE_SIZE, status },
          controller.signal
        );
        const list = res?.data.data || [];
        // Trang N rỗng sau khi hủy đơn cuối cùng của nó: dọn list và GIỮ skeleton cho tới
        // lượt fetch sau, nếu không sẽ loé ra một nhịp danh sách cũ còn nguyên đơn vừa hủy
        if (list.length === 0 && page > 1) {
          setOrders([]);
          setPage((current) => current - 1);
          return;
        }
        setOrders(list);
        setTotal(res.data.total);
        setIsLoading(false);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setLoadError(getErrorMessage(error));
        setIsLoading(false);
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [search, page, status, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((key) => key + 1), []);

  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-4"
        aria-busy
        aria-label="Đang tải đơn hàng"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-white-300 bg-white shadow-card"
          >
            <div className="flex items-center justify-between border-b border-white-300 bg-white-50 px-5 py-3">
              <div className="h-3.5 w-56 animate-pulse rounded bg-white-300" />
              <div className="h-[26px] w-28 animate-pulse rounded-full bg-white-300" />
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="h-[72px] w-[72px] animate-pulse rounded-md bg-white-300" />
              <div className="flex flex-1 flex-col gap-2.5">
                <div className="h-3.5 w-2/5 animate-pulse rounded bg-white-300" />
                <div className="h-3.5 w-1/4 animate-pulse rounded bg-white-300" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white-300 px-5 py-4">
              <div className="h-6 w-40 animate-pulse rounded bg-white-300" />
              <div className="h-9 w-44 animate-pulse rounded-md bg-white-300" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-white-300 bg-white p-6 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Không tải được danh sách đơn hàng</p>
          <p className="text-sm text-dark-400">{loadError}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="px-5"
          onClick={refetch}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    const isSearching = !!search?.trim();
    const isFiltered = isSearching || !!status;
    // Nhắc lại tên mục đang đứng để khách khỏi phải nhìn ngược lên hàng tab
    const tabLabel =
      ORDER_TABS.find((tab) => tab.status === status)?.label ?? "";
    const emptyTitle = isSearching
      ? "Không tìm thấy đơn nào"
      : status
        ? `Chưa có đơn nào ${tabLabel.charAt(0).toLowerCase()}${tabLabel.slice(1)}`
        : "Chưa có đơn hàng nào";
    const emptyHint = isSearching
      ? "Thử tên sản phẩm đã mua, hoặc mã đơn trong email xác nhận đặt hàng."
      : status
        ? "Chọn mục khác để xem đơn ở trạng thái khác."
        : "Đơn bạn đặt sẽ hiện ở đây cùng tiến trình giao hàng.";

    return (
      <div className="flex flex-col items-center rounded-xl border border-white-300 bg-white px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <PackageBox className="h-[26px] w-[26px]" />
        </div>
        <p className="font-bold">{emptyTitle}</p>
        <p className="mt-1 max-w-[380px] text-sm text-dark-400">{emptyHint}</p>
        {!isFiltered && (
          <Link href={PATH.COLLECTION} className="mt-5">
            <Button size="sm" className="px-5">
              Bắt đầu mua sắm
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {total > ORDER_PAGE_SIZE && (
        <Pagination
          className="mt-6"
          total={total}
          currentPage={page}
          pageSize={ORDER_PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </>
  );
};

export default OrderList;
