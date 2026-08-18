import { getOrders } from "@/apis/order";
import { IOrderResponse, OrderApiStatus } from "@/@types/Order.type";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Spin from "@/components/ui/Spin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import OrderItem from "./OrderItem";
import { PATH } from "@/constants/paths";
import useIgnoreFirstEffect from "@/hooks/useIgnoreFirstEffect";

interface OrdersProps {
  status?: string;
  search?: string;
}

const OrderList = ({ status, search }: OrdersProps) => {
  const [dataOrders, setDataOrders] = useState<IOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useIgnoreFirstEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [status]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await getOrders(
          { search, page, pageSize: 4, status: status as OrderApiStatus },
          controller.signal
        );
        setDataOrders(res?.data.data || []);
        setTotalOrders(res.data.total);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch orders:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [search, page, status, refreshKey]);

  const onPaginationChange = (currentPage: number) => {
    setPage(currentPage);
  };

  return (
    <Spin isLoading={isLoading} className="text-dark-200 fill-primary-500">
      {dataOrders.length > 0 ? (
        <>
          {dataOrders.map((order, index) => (
            <OrderItem
              key={order._id}
              order={order}
              isLastItem={index === dataOrders.length - 1}
              onCancelled={() => setRefreshKey((key) => key + 1)}
            />
          ))}

          <Pagination
            total={totalOrders}
            currentPage={page}
            pageSize={4}
            onPageChange={onPaginationChange}
          />
        </>
      ) : (
        <div className="bg-white flex flex-col items-center justify-center gap-6 w-full py-10 px-4">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-semibold text-gray-700">
              Danh sách đơn hàng trống
            </p>
            <p className="text-gray-500 mt-2">
              Hiện tại bạn chưa có đơn hàng nào.
            </p>
          </div>

          <Image
            src="/images/emptyProfile.png"
            quality={100}
            width={300}
            height={300}
            alt="No items found"
            className="object-contain w-64 h-64"
          />

          <Link href={PATH.HOME}>
            <Button className="mt-6 px-6 py-2 text-sm font-medium text-white rounded-lg shadow-lg">
              Trở về trang chủ
            </Button>
          </Link>
        </div>
      )}
    </Spin>
  );
};

export default OrderList;
