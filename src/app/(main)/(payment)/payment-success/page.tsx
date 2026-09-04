"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "@/components/icons";
import Button from "@/components/ui/Button";
import Spin from "@/components/ui/Spin";
import { getGuestOrder } from "@/apis/order";
import { getCountdownStorageKey } from "@/components/ui/CountdownTimer";
import { useCartStore } from "@/store/useCartStore";
import { removeLocalStorage } from "@/utils/localStorage";
import { PATH } from "@/constants/paths";
import { IOrderResponse } from "@/@types/Order.type";
import { formatPrice } from "@/utils/formatPrice";
import { PAYMENT_METHOD_LABEL, PaymentMethod } from "@/constants/payment";
import { statusStyles } from "@/constants/orderStatus";

const paymentLabel = (method?: string) =>
  method && method in PAYMENT_METHOD_LABEL
    ? PAYMENT_METHOD_LABEL[method as PaymentMethod]
    : (method ?? "—");

const PaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const email = searchParams.get("email") ?? "";

  const [order, setOrder] = useState<IOrderResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Đích của checkout: BE đã dọn cart trong transaction tạo đơn → badge Header về 0;
  // countdown reset ở đây (mount sau khi timer unmount) để không đua với tick 1s ở checkout
  useEffect(() => {
    removeLocalStorage(getCountdownStorageKey(PATH.CART));
    useCartStore.getState().fetchCart(true);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber || !email) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      try {
        // Tra cứu bằng orderNumber + email — dùng được cho cả user lẫn guest
        const res = await getGuestOrder(orderNumber, email);
        setOrder(res?.data);
      } catch {
        // Không tra được đơn (sai mã/email, gõ URL tay) → không hiện màn thành công giả
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber, email]);

  if (!isLoading && notFound) {
    return (
      <div className="custom-card mx-auto !px-8 !py-10 md:w-[850px] w-full text-center">
        <h1 className="text-2xl text-dark-900 mb-4">Không tìm thấy đơn hàng</h1>
        <p className="text-dark-500 mb-10">
          Mã đơn hoặc email không đúng. Vui lòng kiểm tra lại email xác nhận đơn
          hàng của bạn.
        </p>
        <Button className="px-4 uppercase" onClick={() => router.push("/")}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  const orderInfo = [
    {
      label: "Mã đơn hàng:",
      value: order?.orderNumber ?? orderNumber ?? "—",
      customClass: "text-dark-800",
    },
    {
      label: "Phương thức thanh toán:",
      value: paymentLabel(order?.paymentInfo?.method),
      customClass: "text-dark-800",
    },
    {
      label: "Thời gian giao hàng dự kiến:",
      value: "3-5 ngày",
      customClass: "text-dark-800",
    },
    {
      label: "Tổng thanh toán:",
      value: formatPrice(order?.checkoutInfo?.totalPrice ?? 0),
      customClass: "text-red-600 font-bold",
    },
    {
      label: "Tình trạng:",
      value:
        order?.status && order.status in statusStyles
          ? statusStyles[order.status as keyof typeof statusStyles].label
          : "Chờ xác nhận",
      customClass: "text-red-600",
    },
  ];

  return (
    <div className="custom-card mx-auto !px-8 !py-10 md:w-[850px] w-full">
      <div className="flex flex-col items-center justify-center pb-10">
        <Check className="mb-4 p-2 text-white bg-primary-700 w-14 h-14 rounded-full" />
        <h1 className="text-2xl text-dark-900 text-center">
          Đặt hàng thành công
        </h1>
      </div>

      <Spin isLoading={isLoading} className="text-dark-200 fill-primary-500">
        <div className="flex flex-col gap-4 mt-6 mb-12 text-dark-500 text-lg">
          {orderInfo.map((item, index) => (
            <p className="flex justify-between" key={index}>
              {item.label}
              <span className={item.customClass}>{item.value}</span>
            </p>
          ))}
        </div>
      </Spin>

      <div className="flex flex-col md:flex-row gap-4 md:gap-5">
        <Button
          className="px-4 w-full uppercase"
          variant={"outlined"}
          onClick={() => router.push("/user/orders")}
        >
          Xem đơn hàng
        </Button>
        <Button
          className="px-4 w-full uppercase"
          onClick={() => router.push("/")}
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    </div>
  );
};

export default function PaymentSuccess() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
