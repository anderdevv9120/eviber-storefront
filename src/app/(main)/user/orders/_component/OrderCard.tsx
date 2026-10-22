"use client";

import Link from "next/link";
import { IOrderResponse } from "@/@types/Order.type";
import Button from "@/components/ui/Button";
import { cn } from "@/config/utils";
import { PATH } from "@/constants/paths";
import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatTime";
import OrderStatusPill, {
  isKnownStatus,
  STATUS_HEADER,
} from "./OrderStatusPill";
import OrderProductLine from "@/components/ui/OrderProductLine";
import OrderComboBlock from "@/components/ui/OrderComboBlock";
import { groupOrderProducts } from "@/utils/combo";
import OrderReviewLink from "./OrderReviewLink";
import CancelOrderModal from "@/components/ui/CancelOrderModal";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import { useReorder } from "@/hooks/useReorder";

/** Số dòng sản phẩm hiện trên card — phần còn lại gộp thành một dòng đếm */
const VISIBLE_PRODUCTS = 2;

interface OrderCardProps {
  order: IOrderResponse;
  /** Gọi sau khi hủy đơn thành công để parent refetch danh sách */
  onCancelled?: () => void;
}

const OrderCard = ({ order, onCancelled }: OrderCardProps) => {
  const { reorder, reorderingId } = useReorder();
  const {
    _id,
    created_at,
    status,
    paymentStatus,
    productInfo,
    combos,
    checkoutInfo,
    orderNumber,
  } = order;
  const cancel = useCancelOrder(_id, onCancelled);
  const totalQuantity = productInfo.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const groups = groupOrderProducts(productInfo, combos);
  const hiddenCount = groups
    .slice(VISIBLE_PRODUCTS)
    .reduce(
      (sum, group) => sum + (group.kind === "combo" ? group.pieces.length : 1),
      0
    );
  const reviewAction = (productId: string) =>
    orderNumber && (
      <OrderReviewLink productId={productId} orderNumber={orderNumber} />
    );
  // Đơn đã trả tiền khách không tự hủy (BE 400) → không hiện nút
  const canCancel = status === "pending" && paymentStatus !== "paid";

  return (
    <article className="overflow-hidden rounded-xl border border-white-300 bg-white shadow-card">
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white-300 px-4 py-3 sm:px-5",
          isKnownStatus(status) ? STATUS_HEADER[status] : "bg-white-50"
        )}
      >
        <p className="text-xs text-dark-400">
          Mã đơn{" "}
          <span className="text-sm font-bold tracking-wide text-dark">
            {orderNumber ?? "—"}
          </span>{" "}
          · đặt ngày {formatDate(created_at, "DD/MM/YYYY")}
        </p>
        <OrderStatusPill status={status} />
      </header>

      <div className="px-4 sm:px-5">
        {groups
          .slice(0, VISIBLE_PRODUCTS)
          .map((group, index) =>
            group.kind === "combo" ? (
              <OrderComboBlock
                key={group.combo.comboGroupId}
                combo={group.combo}
                pieces={group.pieces}
                className="my-4"
                reviewAction={reviewAction}
              />
            ) : (
              <OrderProductLine
                key={`product-${index}-${group.line.variantId}`}
                product={group.line}
                className="border-t border-white-200 py-4 first:border-t-0"
                reviewAction={reviewAction(group.line.productId)}
              />
            )
          )}
        {hiddenCount > 0 && (
          <p className="border-t border-white-200 py-3 text-sm text-dark-400">
            và {hiddenCount} sản phẩm khác
          </p>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-white-300 px-4 py-4 sm:px-5">
        <p className="text-sm text-dark-400">
          Tổng cộng ({totalQuantity} sản phẩm)
          <span className="block text-lg font-extrabold text-dark">
            {formatPrice(checkoutInfo.totalPrice)}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {canCancel ? (
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
              onClick={() => reorder(_id, productInfo, combos)}
            >
              Mua lại
            </Button>
          )}
          {orderNumber && (
            <Link href={`${PATH.ORDER}/${orderNumber}`}>
              <Button size="sm" className="px-4">
                Xem chi tiết
              </Button>
            </Link>
          )}
        </div>
      </footer>

      {cancel.isConfirmOpen && (
        <CancelOrderModal
          isOpen
          orderNumber={orderNumber}
          isCancelling={cancel.isCancelling}
          onClose={cancel.closeConfirm}
          onConfirm={cancel.confirmCancel}
        />
      )}
    </article>
  );
};

export default OrderCard;
