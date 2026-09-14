"use client";

import { IOrderResponse } from "@/@types/Order.type";
import Button from "@/components/ui/Button";
import { cn } from "@/config/utils";
import { PAYMENT_METHOD_LABEL, PaymentMethod } from "@/constants/payment";
import { formatAddress } from "@/utils/formatAddress";
import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatTime";
import OrderStatusPill, {
  isKnownStatus,
  STATUS_HEADER,
} from "./OrderStatusPill";
import OrderProductLine from "./OrderProductLine";
import OrderTimeline from "./OrderTimeline";
import CancelOrderModal from "./CancelOrderModal";
import { useCancelOrder } from "./useCancelOrder";
import { useReorder } from "./useReorder";

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
  failed: "Thanh toán thất bại",
};

const SECTION = "border-t border-white-300 p-4 sm:p-5";
const SECTION_TITLE =
  "mb-3 text-xs font-extrabold uppercase tracking-wider text-dark-300";

interface OrderDetailViewProps {
  order: IOrderResponse;
  /** Gọi sau khi hủy đơn để nạp lại chi tiết — timeline phải có thêm mốc Đã hủy */
  onRefresh?: () => void;
}

const OrderDetailView = ({ order, onRefresh }: OrderDetailViewProps) => {
  const { reorder, reorderingId } = useReorder();

  const {
    _id,
    orderNumber,
    status,
    created_at,
    productInfo,
    checkoutInfo,
    shippingInfo,
    paymentInfo,
    paymentStatus,
  } = order;

  const cancel = useCancelOrder(_id, onRefresh);
  const totalQuantity = productInfo.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const paymentLabel = paymentInfo?.method
    ? (PAYMENT_METHOD_LABEL[paymentInfo.method as PaymentMethod] ??
      paymentInfo.method)
    : "Chưa có thông tin thanh toán";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-wide md:text-2xl">
            {orderNumber ?? "Đơn hàng"}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            Đặt ngày {formatDate(created_at, "DD/MM/YYYY")} · {totalQuantity}{" "}
            sản phẩm · {formatPrice(checkoutInfo.totalPrice)}
          </p>
        </div>

        <div className="flex flex-none gap-2">
          {status === "pending" ? (
            <Button
              size="sm"
              variant="secondary"
              className="px-4"
              onClick={cancel.openConfirm}
            >
              Hủy đơn
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="px-4"
              loading={reorderingId === _id}
              onClick={() => reorder(_id, productInfo)}
            >
              Mua lại
            </Button>
          )}
        </div>
      </div>

      <section className="mb-4 overflow-hidden rounded-xl border border-white-300 bg-white shadow-card">
        <header
          className={cn(
            "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white-300 px-4 py-3 sm:px-5",
            isKnownStatus(status) ? STATUS_HEADER[status] : "bg-white-50"
          )}
        >
          <h2 className="text-sm font-bold">Tiến trình đơn</h2>
          <OrderStatusPill status={status} />
        </header>
        <div className="p-4 sm:p-6">
          <OrderTimeline order={order} />
        </div>
      </section>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-white-300 bg-white p-4 sm:p-5">
          <h2 className={SECTION_TITLE}>Giao đến</h2>
          <p className="font-semibold">{shippingInfo.name}</p>
          <p className="mt-0.5 text-sm text-dark-500">
            {shippingInfo.phoneNumber}
          </p>
          <p className="mt-2 text-sm text-dark-500">
            {formatAddress(shippingInfo)}
          </p>
          {shippingInfo.note && (
            <p className="mt-2 text-sm text-dark-400">
              Ghi chú: {shippingInfo.note}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-white-300 bg-white p-4 sm:p-5">
          <h2 className={SECTION_TITLE}>Thanh toán</h2>
          <p className="font-semibold">{paymentLabel}</p>
          <p className="mt-0.5 text-sm text-dark-500">
            {PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}
          </p>

          <dl className="mt-4 border-t border-white-300 pt-4 text-sm">
            <div className="flex justify-between text-dark-500">
              <dt>Tạm tính</dt>
              <dd>{formatPrice(checkoutInfo.subtotal)}</dd>
            </div>
            <div className="mt-2 flex justify-between text-dark-500">
              <dt>Phí vận chuyển</dt>
              <dd>
                {checkoutInfo.shippingFee
                  ? formatPrice(checkoutInfo.shippingFee)
                  : "Miễn phí"}
              </dd>
            </div>
            {!!checkoutInfo.discountAmount && (
              <div className="mt-2 flex justify-between text-dark-500">
                <dt>Giảm giá</dt>
                <dd>−{formatPrice(checkoutInfo.discountAmount)}</dd>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-white-300 pt-3 text-base font-bold">
              <dt>Tổng cộng</dt>
              <dd>{formatPrice(checkoutInfo.totalPrice)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-white-300 bg-white">
        <header className="flex items-center justify-between border-b border-white-300 bg-white-50 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold">Sản phẩm trong đơn</h2>
          <span className="text-sm text-dark-400">
            {productInfo.length} sản phẩm
          </span>
        </header>
        <div className="px-4 sm:px-5">
          {productInfo.map((product) => (
            <OrderProductLine
              key={product.variantId}
              product={product}
              showSku
              className="border-t border-white-200 py-4 first:border-t-0"
            />
          ))}
        </div>
        {order.customerNote && (
          <div className={SECTION}>
            <h2 className={SECTION_TITLE}>Ghi chú của bạn</h2>
            <p className="text-sm text-dark-500">{order.customerNote}</p>
          </div>
        )}
      </section>

      {cancel.isConfirmOpen && (
        <CancelOrderModal
          isOpen
          orderNumber={orderNumber}
          isCancelling={cancel.isCancelling}
          onClose={cancel.closeConfirm}
          onConfirm={cancel.confirmCancel}
        />
      )}
    </div>
  );
};

export default OrderDetailView;
