"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Clock, RightArrow, XMark } from "@/components/icons";
import Button from "@/components/ui/Button";
import { getCountdownStorageKey } from "@/components/ui/CountdownTimer";
import { getMyOrderDetail, getOrderByNumber } from "@/apis/order";
import { ApiError } from "@/config/axios";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { removeLocalStorage } from "@/utils/localStorage";
import { formatAddress } from "@/utils/formatAddress";
import { formatDeliveryEstimate, formatTimeDayMonth } from "@/utils/formatTime";
import { getBankTransferState } from "@/utils/bankTransfer";
import { useReorder } from "@/hooks/useReorder";
import { useNow } from "@/hooks/useNow";
import { usePaymentPolling } from "@/hooks/usePaymentPolling";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import CancelOrderModal from "@/components/ui/CancelOrderModal";
import { PATH } from "@/constants/paths";
import { DELIVERY_ESTIMATE_DAYS } from "@/constants/payment";
import { statusStyles } from "@/constants/orderStatus";
import { IOrderResponse } from "@/@types/Order.type";
import { cn } from "@/config/utils";
import CopyButton from "@/components/ui/CopyButton";
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
  const [isQrActive, setIsQrActive] = useState(false);
  // Tick mỗi phút để đơn chuyển khoản tự sang "hết hạn" đúng giờ dù job BE chưa quét
  const now = useNow();
  const { reorder, reorderingId } = useReorder();
  const bankState = order ? getBankTransferState(order, now) : null;

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

  // Polling và nạp lại sau khi hủy cùng ghi `order`: chỉ request gửi sau cùng được ghi,
  // không thì lượt poll gửi trước khi hủy về muộn kéo đơn đã hủy về lại "chờ thanh toán"
  const refreshSeq = useRef(0);
  const refreshOrder = useCallback(async () => {
    const seq = ++refreshSeq.current;
    const res = await getOrderByNumber(orderNumber);
    if (seq === refreshSeq.current && res?.data) setOrder(res.data);
  }, [orderNumber]);

  // Tiền về (webhook payOS hoặc admin duyệt) → trang tự đổi sang "Đã nhận thanh toán" chừng nào mã QR còn sống
  usePaymentPolling(
    bankState === "awaiting" && isQrActive && Boolean(orderNumber),
    refreshOrder
  );

  // Response tra cứu công khai không mang chủ đơn — hỏi route chỉ chủ đơn gọi được (404 với người khác)
  // để chỉ chủ đơn thấy nút Hủy; khách vãng lai không có đường hủy (đơn tự hết hạn)
  const isAwaiting = bankState === "awaiting";
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !isAwaiting || !orderNumber) return;
    const controller = new AbortController();
    getMyOrderDetail(orderNumber, controller.signal)
      .then(() => setIsOwner(true))
      .catch(() => setIsOwner(false));
    return () => controller.abort();
  }, [isLoggedIn, isAwaiting, orderNumber]);

  const cancel = useCancelOrder(order?._id ?? "", () => {
    refreshOrder().catch(() => undefined);
  });

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
    bankState === "awaiting"
      ? "Chờ thanh toán"
      : order.status && order.status in statusStyles
        ? statusStyles[order.status as keyof typeof statusStyles].label
        : statusStyles.pending.label;
  const isClosed = bankState === "expired" || bankState === "cancelled";
  const hero = getHero(bankState, order, shippingInfo.email);
  const dueLabel = order.paymentDueAt
    ? formatTimeDayMonth(order.paymentDueAt, "long")
    : "";
  const deliveryEstimate = formatDeliveryEstimate(
    order.created_at,
    DELIVERY_ESTIMATE_DAYS.min,
    DELIVERY_ESTIMATE_DAYS.max
  );

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
      <div className="w-full lg:flex-1">
        <div className="mb-5 flex items-center gap-4">
          <span
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-full",
              hero.tone === "pending" && "bg-primary-100 text-primary-700",
              hero.tone === "done" && "bg-primary text-white",
              hero.tone === "closed" && "bg-white-300 text-dark-500"
            )}
          >
            {hero.tone === "pending" ? (
              <Clock className="h-5 w-5" />
            ) : (
              <Check className="h-5 w-5" />
            )}
          </span>
          <div>
            <h1
              className="text-xl font-extrabold md:text-2xl"
              data-testid="success-hero-title"
            >
              {hero.title}
            </h1>
            <p className="mt-1 text-sm text-dark-500">{hero.subtitle}</p>
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
            bankState={bankState}
            now={now}
            paymentDueAt={order.paymentDueAt}
            paidAt={order.paidAt}
            paymentStatus={order.paymentStatus}
            onQrActiveChange={setIsQrActive}
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
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-2 font-semibold",
                  isClosed ? "text-terracotta" : "text-primary-800"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isClosed ? "bg-terracotta" : "bg-primary"
                  )}
                />
                {statusLabel}
                {bankState === "expired" && " · quá hạn"}
              </p>
            </div>
            {deliveryEstimate && !isClosed && (
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
        combos={order.combos}
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
        {isClosed ? (
          <>
            <Button
              size="lg"
              className="w-full"
              loading={reorderingId === order._id}
              onClick={() => reorder(order._id, productInfo, order.combos)}
              data-testid="reorder-products"
            >
              Đặt lại các sản phẩm này
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="mt-1 w-full"
              onClick={() => router.push(PATH.HOME)}
            >
              Tiếp tục mua sắm
            </Button>
          </>
        ) : bankState === "awaiting" ? (
          // Việc chính là mã QR bên trái — lối ra chỉ là link chữ, kèm cách quay lại để rời trang không bị hiểu là mất đơn
          <>
            <p
              className="text-sm text-dark-500"
              data-testid="awaiting-leave-hint"
            >
              {dueLabel ? (
                <>
                  Đơn được giữ tới{" "}
                  <b className="font-semibold text-dark-800">{dueLabel}</b>
                  .{" "}
                </>
              ) : null}
              Mở lại từ email
              {isLoggedIn ? (
                <>
                  {" "}
                  hoặc{" "}
                  <Link
                    href={PATH.ORDER}
                    className="rounded font-semibold text-primary-700 transition-colors hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
                  >
                    Đơn hàng của tôi
                  </Link>
                </>
              ) : null}{" "}
              để thanh toán sau.
            </p>
            {/* Nút viền, không đặc: nút đặc dành cho trạng thái đã trả — lúc này mã QR mới là việc chính */}
            <Button
              size="lg"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.push(PATH.HOME)}
            >
              Tiếp tục mua sắm
            </Button>
            {isOwner && (
              // Hủy là thao tác không hoàn tác: tách khỏi lối ra mua sắm bằng hairline + khoảng cách,
              // giữ ở cấp thấp nhất panel (mã QR mới là việc chính)
              <div className="mt-5 flex justify-center border-t border-white-500 pt-2">
                <Button
                  size="sm"
                  variant="subtle-danger"
                  data-testid="awaiting-cancel-order"
                  onClick={cancel.openConfirm}
                >
                  <XMark className="h-3.5 w-3.5" />
                  Hủy đơn hàng
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push(PATH.HOME)}
            >
              Tiếp tục mua sắm
            </Button>
            {/* Khách vãng lai: chỉ mở được hoàn tiền sau khi xác thực qua email đặt hàng (biết mã đơn là chưa đủ);
                người đã đăng nhập vào từ chi tiết đơn trong tài khoản */}
            {!isLoggedIn && (
              <Link
                href={`${PATH.REFUND_ACCESS}?orderNumber=${encodeURIComponent(order.orderNumber ?? "")}`}
                data-testid="guest-refund-entry"
                className="mt-1 flex h-10 w-full items-center justify-center rounded-btn text-sm font-semibold text-dark-500 transition hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
              >
                Yêu cầu hoàn tiền
              </Link>
            )}
          </>
        )}
      </OrderSummaryPanel>

      {cancel.isConfirmOpen && (
        <CancelOrderModal
          isOpen={cancel.isConfirmOpen}
          orderNumber={order.orderNumber}
          isCancelling={cancel.isCancelling}
          onClose={cancel.closeConfirm}
          onConfirm={cancel.confirmCancel}
        />
      )}
    </div>
  );
};

/**
 * Hero là câu trả lời cho "tôi có cần làm gì nữa không": chờ chuyển khoản → nói việc phải làm
 * + hạn; đã nhận → xong việc; hết hạn → nói vì sao hủy, không đổ lỗi cho khách (E2: hero trung tính).
 */
function getHero(
  bankState: ReturnType<typeof getBankTransferState>,
  order: IOrderResponse,
  email: string
): { tone: "pending" | "done" | "closed"; title: string; subtitle: string } {
  const due = order.paymentDueAt
    ? formatTimeDayMonth(order.paymentDueAt, "long")
    : "";
  switch (bankState) {
    case "awaiting":
      return {
        tone: "pending",
        title: "Chuyển khoản để hoàn tất đơn",
        subtitle: due
          ? `Đơn giữ chỗ tới ${due}, quá hạn sẽ tự hủy. Link thanh toán cũng đã gửi tới ${email}`
          : `Link thanh toán đã gửi tới ${email}`,
      };
    case "paid":
      return {
        tone: "done",
        title: "Đã nhận thanh toán",
        subtitle: `Shop đang chuẩn bị hàng. Xác nhận đã gửi tới ${email}`,
      };
    case "expired":
      return {
        tone: "closed",
        title: "Đơn này đã hết hạn thanh toán",
        subtitle: closedSubtitle(
          order.paymentStatus,
          due
            ? `Không nhận được chuyển khoản trước ${due} nên đơn tự hủy và hàng trả về kho.`
            : "Không nhận được chuyển khoản đúng hạn nên đơn tự hủy và hàng trả về kho."
        ),
      };
    case "cancelled":
      return {
        tone: "closed",
        title: "Đơn này đã hủy",
        subtitle: closedSubtitle(
          order.paymentStatus,
          "Đơn hủy trước khi thanh toán, hàng đã trả về kho."
        ),
      };
    default:
      return {
        tone: "done",
        title: "Đã nhận đơn của bạn",
        subtitle: `Xác nhận đơn đã gửi tới ${email}`,
      };
  }
}

// Đơn đã đóng nhưng tiền đã về (muộn) / đã hoàn: hero không được nói "chưa nhận"
function closedSubtitle(paymentStatus: string, unpaidText: string) {
  if (paymentStatus === "paid")
    return "Đơn đã hủy nhưng shop đã nhận tiền, sẽ liên hệ để hoàn lại.";
  if (paymentStatus === "refunded")
    return "Đơn đã hủy, tiền đã được hoàn lại cho bạn.";
  return unpaidText;
}

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
