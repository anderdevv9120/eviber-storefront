"use client";

import { useState } from "react";
import { IOrderResponse } from "@/@types/Order.type";
import Button from "@/components/ui/Button";
import { cn } from "@/config/utils";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/constants/payment";
import BankTransferPanel from "@/components/ui/BankTransferPanel";
import { formatAddress } from "@/utils/formatAddress";
import { formatCouponDiscountLabel, formatPrice } from "@/utils/formatPrice";
import { formatDate, formatDateTime } from "@/utils/formatTime";
import { getBankTransferState } from "@/utils/bankTransfer";
import OrderStatusPill, {
  isKnownStatus,
  STATUS_HEADER,
} from "./OrderStatusPill";
import OrderProductLine from "@/components/ui/OrderProductLine";
import OrderComboBlock from "@/components/ui/OrderComboBlock";
import { groupOrderProducts } from "@/utils/combo";
import RefundPanel from "@/components/refunds/RefundPanel";
import Modal from "@/components/ui/Modal";
import OrderReviews from "./OrderReviews";
import OrderTimeline from "./OrderTimeline";
import CancelOrderModal from "@/components/ui/CancelOrderModal";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import { useReorder } from "@/hooks/useReorder";
import { useNow } from "@/hooks/useNow";
import { usePaymentPolling } from "@/hooks/usePaymentPolling";

const SECTION = "border-t border-white-300 p-4 sm:p-5";
const SECTION_TITLE =
  "mb-3 text-xs font-extrabold uppercase tracking-wider text-dark-300";

interface OrderDetailViewProps {
  order: IOrderResponse;
  /**
   * Nạp lại chi tiết: sau khi hủy đơn (timeline thêm mốc Đã hủy) và theo nhịp polling lúc chờ
   * chuyển khoản. `quiet` = lượt nền, lỗi không toast.
   */
  onRefresh?: (options?: { quiet?: boolean }) => Promise<void> | void;
}

const OrderDetailView = ({ order, onRefresh }: OrderDetailViewProps) => {
  const { reorder, reorderingId } = useReorder();

  const {
    _id,
    orderNumber,
    status,
    created_at,
    productInfo,
    combos,
    checkoutInfo,
    shippingInfo,
    paymentInfo,
    paymentStatus,
    paidAt,
  } = order;

  const cancel = useCancelOrder(_id, onRefresh);
  // Qua mốc hạn lúc trang đang mở: khối chuyển khoản tự thu về "hết hạn", không mời chuyển tiếp
  const now = useNow();
  const bankState = getBankTransferState(order, now);
  const isAwaitingTransfer = bankState === "awaiting";
  const [isQrActive, setIsQrActive] = useState(false);

  usePaymentPolling(
    isAwaitingTransfer && isQrActive && Boolean(onRefresh),
    async () => {
      await onRefresh?.({ quiet: true });
    }
  );
  // Đơn đã trả tiền: khách không tự hủy (BE 400 + hướng liên hệ) → ẩn nút, không để bấm rồi lỗi
  const canCancel = status === "pending" && paymentStatus !== "paid";
  // Đơn chưa được xác nhận chưa có gì để hoàn; từ confirmed trở đi mới mở được hoàn tiền
  const canRefund = Boolean(orderNumber) && status !== "pending";
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const totalQuantity = productInfo.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const paymentLabel = paymentInfo?.method
    ? (PAYMENT_METHOD_LABEL[paymentInfo.method] ?? paymentInfo.method)
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
          {canCancel ? (
            <Button
              size="sm"
              variant="secondary"
              className="px-4"
              onClick={cancel.openConfirm}
            >
              Hủy đơn
            </Button>
          ) : status === "pending" ? null : (
            <Button
              size="sm"
              variant="outline"
              className="px-4"
              loading={reorderingId === _id}
              onClick={() => reorder(_id, productInfo, combos)}
            >
              Mua lại
            </Button>
          )}
          {canRefund && (
            <Button
              size="sm"
              variant="secondary"
              className="px-4"
              data-testid="order-refund-open"
              onClick={() => setIsRefundOpen(true)}
            >
              Hoàn tiền
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
          {isAwaitingTransfer ? (
            <h2 className={SECTION_TITLE}>Tổng tiền</h2>
          ) : (
            <>
              <h2 className={SECTION_TITLE}>Thanh toán</h2>
              <p className="font-semibold">{paymentLabel}</p>
              {/* Đơn 0đ: nhãn phương thức đã là "Không cần thanh toán", không lặp dòng trạng thái */}
              {paymentStatus !== "not_required" && (
                <p className="mt-0.5 text-sm text-dark-500">
                  {PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}
                  {paymentStatus === "paid" &&
                    paidAt &&
                    ` · ${formatDateTime(paidAt)}`}
                  {bankState === "expired" && " · hết hạn chuyển khoản"}
                </p>
              )}
            </>
          )}

          <dl
            className={cn(
              "text-sm",
              !isAwaitingTransfer && "mt-4 border-t border-white-300 pt-4"
            )}
          >
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
              <div className="mt-2 flex justify-between gap-2 text-dark-500">
                <dt>{formatCouponDiscountLabel(checkoutInfo)}</dt>
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

      {isAwaitingTransfer && orderNumber && (
        <section
          data-testid="order-bank-transfer"
          className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4 sm:p-5"
        >
          <BankTransferPanel
            state="awaiting"
            orderNumber={orderNumber}
            now={now}
            paymentDueAt={order.paymentDueAt}
            eyebrow={`Thanh toán · ${paymentLabel}`}
            onQrActiveChange={setIsQrActive}
          />
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-white-300 bg-white">
        <header className="flex items-center justify-between border-b border-white-300 bg-white-50 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold">Sản phẩm trong đơn</h2>
          <span className="text-sm text-dark-400">
            {combos?.length ? totalQuantity : productInfo.length} sản phẩm
          </span>
        </header>
        <div className="px-4 sm:px-5">
          {groupOrderProducts(productInfo, combos).map((group, index) =>
            group.kind === "combo" ? (
              <OrderComboBlock
                key={group.combo.comboGroupId}
                combo={group.combo}
                pieces={group.pieces}
                showSku
                className="my-4"
              />
            ) : (
              <OrderProductLine
                key={`product-${index}-${group.line.variantId}`}
                product={group.line}
                showSku
                className="border-t border-white-200 py-4 first:border-t-0"
              />
            )
          )}
        </div>
        {order.customerNote && (
          <div className={SECTION}>
            <h2 className={SECTION_TITLE}>Ghi chú của bạn</h2>
            <p className="text-sm text-dark-500">{order.customerNote}</p>
          </div>
        )}
      </section>

      <OrderReviews key={_id} products={productInfo} />

      {/* Nội dung hoàn tiền chỉ mount khi mở: trang đơn giữ gọn, panel không fetch sẵn */}
      {isRefundOpen && orderNumber && (
        <Modal
          isOpen
          title="Hoàn tiền"
          titleClassName="text-xl"
          className="w-[640px]"
          isShowFooter={false}
          onCancel={() => setIsRefundOpen(false)}
        >
          <RefundPanel key={orderNumber} orderNumber={orderNumber} embedded />
        </Modal>
      )}

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
