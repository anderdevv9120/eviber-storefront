"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, RightArrow } from "@/components/icons";
import Button from "@/components/ui/Button";
import { getCountdownStorageKey } from "@/components/ui/CountdownTimer";
import { getOrderByNumber } from "@/apis/order";
import { ApiError } from "@/config/axios";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { removeLocalStorage } from "@/utils/localStorage";
import { formatAddress } from "@/utils/formatAddress";
import { formatDeliveryEstimate } from "@/utils/formatTime";
import { PATH } from "@/constants/paths";
import { DELIVERY_ESTIMATE_DAYS } from "@/constants/payment";
import { statusStyles } from "@/constants/orderStatus";
import { IOrderResponse } from "@/@types/Order.type";
import CopyButton from "./CopyButton";
import OrderSummaryPanel from "./OrderSummaryPanel";
import PaymentActionCard from "./PaymentActionCard";

const PaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const isLoggedIn = useAppStore((s) => Boolean(s.profile._id));

  const [order, setOrder] = useState<IOrderResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<"notFound" | "throttled">();

  // Đích của checkout: BE đã dọn cart trong transaction tạo đơn → badge Header về 0;
  // countdown reset ở đây (mount sau khi timer unmount) để không đua với tick 1s ở checkout
  useEffect(() => {
    removeLocalStorage(getCountdownStorageKey(PATH.CART));
    useCartStore.getState().fetchCart(true);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setErrorKind(undefined);
      setIsLoading(true);
      if (!orderNumber) {
        setErrorKind("notFound");
        setIsLoading(false);
        return;
      }
      try {
        const res = await getOrderByNumber(orderNumber);
        setOrder(res?.data);
      } catch (error: unknown) {
        // Interceptor reject ApiError chứ KHÔNG phải AxiosError — dùng axios.isAxiosError ở
        // đây là nhánh chết. Endpoint siết 20 req/60s, khách F5 vài lần là dính nên phải
        // nói đúng nguyên nhân thay vì đổ cho sai mã đơn
        const isThrottled = error instanceof ApiError && error.status === 429;
        setErrorKind(isThrottled ? "throttled" : "notFound");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (isLoading) return <PaymentSuccessSkeleton />;

  if (errorKind || !order) {
    const isThrottled = errorKind === "throttled";
    return (
      <div className="mx-auto w-full max-w-[560px] rounded-xl border border-white-200 bg-white px-8 py-10 text-center shadow-card">
        <h1 className="mb-3 text-2xl font-bold">
          {isThrottled ? "Tra cứu quá nhanh" : "Không tìm thấy đơn hàng"}
        </h1>
        <p className="mb-8 text-dark-500">
          {isThrottled
            ? "Bạn vừa mở lại đơn nhiều lần liên tiếp. Chờ khoảng một phút rồi tải lại trang."
            : "Mã đơn không đúng. Kiểm tra lại đường dẫn bạn đã lưu, hoặc liên hệ shop kèm mã đơn để được tra cứu."}
        </p>
        {isThrottled ? (
          <Button size="lg" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        ) : (
          <Button size="lg" onClick={() => router.push(PATH.HOME)}>
            Về trang chủ
          </Button>
        )}
      </div>
    );
  }

  const { shippingInfo, checkoutInfo, paymentInfo, productInfo } = order;
  const statusLabel =
    order.status && order.status in statusStyles
      ? statusStyles[order.status as keyof typeof statusStyles].label
      : statusStyles.pending.label;
  const deliveryEstimate = formatDeliveryEstimate(
    order.created_at,
    DELIVERY_ESTIMATE_DAYS.min,
    DELIVERY_ESTIMATE_DAYS.max
  );

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
      <div className="w-full lg:flex-1">
        <div className="mb-5 flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-white">
            <Check className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold md:text-2xl">
              Đã nhận đơn của bạn
            </h1>
            <p className="mt-1 text-sm text-dark-500">
              Xác nhận đơn đã gửi tới{" "}
              <b className="font-semibold text-dark-800">
                {shippingInfo.email}
              </b>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white-200 bg-white px-6 shadow-card">
          <section className="flex flex-wrap items-center justify-between gap-4 border-b border-white-500 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
                Mã đơn hàng
              </p>
              <p
                className="mt-1 text-xl font-extrabold tabular-nums tracking-wide"
                data-testid="success-order-number"
              >
                {order.orderNumber}
              </p>
            </div>
            <CopyButton
              value={order.orderNumber ?? ""}
              label="Sao chép mã"
              copiedLabel="Đã sao chép"
              testId="copy-order-number"
            />
          </section>

          <PaymentActionCard
            method={paymentInfo?.method}
            totalPrice={checkoutInfo.totalPrice}
            orderNumber={order.orderNumber ?? ""}
          />

          <section
            data-testid="success-shipping"
            className="border-b border-white-500 py-5"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
              Giao đến
            </p>
            <p className="mt-1 font-semibold">
              {shippingInfo.name} · {shippingInfo.phoneNumber}
            </p>
            <p className="text-sm leading-relaxed text-dark-500">
              {formatAddress(shippingInfo)}
            </p>
            {order.customerNote && (
              <p className="mt-1.5 text-sm leading-relaxed text-dark-500">
                Ghi chú: {order.customerNote}
              </p>
            )}
          </section>

          <section className="flex flex-wrap items-end justify-between gap-4 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
                Trạng thái
              </p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold text-primary-800">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {statusLabel}
              </p>
            </div>
            {deliveryEstimate && (
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
                  Dự kiến giao
                </p>
                <p className="mt-1 text-lg font-extrabold">
                  {deliveryEstimate}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      <OrderSummaryPanel
        products={productInfo}
        checkoutInfo={checkoutInfo}
        headerAction={
          isLoggedIn ? (
            <button
              type="button"
              onClick={() => router.push(PATH.ORDER)}
              className="group/link inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary-700 transition-colors hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
            >
              Xem đơn hàng
              <RightArrow className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
            </button>
          ) : (
            <CopyButton
              icon="link"
              value={typeof window === "undefined" ? "" : window.location.href}
              label="Sao chép link"
              copiedLabel="Đã sao chép"
              testId="copy-lookup-link"
            />
          )
        }
      >
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push(PATH.HOME)}
        >
          Tiếp tục mua sắm
        </Button>
      </OrderSummaryPanel>
    </div>
  );
};

function PaymentSuccessSkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-start gap-8 lg:flex-row lg:gap-10">
      <div className="flex w-full flex-col gap-4 lg:flex-1">
        <div className="h-14 w-2/3 rounded-xl bg-white-300" />
        <div className="h-72 rounded-xl bg-white-300" />
      </div>
      <div className="h-[380px] w-full rounded-xl bg-white-300 lg:w-[400px]" />
    </div>
  );
}

export default function PaymentSuccessView() {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
