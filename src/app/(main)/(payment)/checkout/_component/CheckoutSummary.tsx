import { forwardRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { cn } from "@/config/utils";
import { formatPrice } from "@/utils/formatPrice";
import { ICartItem, ICartResponse } from "@/@types/Cart.type";
import type { ICheckoutReview } from "@/@types/Order.type";
import type { ICheckoutReviewCombo } from "@/@types/Combo.type";
import { unavailableReason } from "@/utils/cartAvailability";

interface CheckoutSummaryProps {
  cart: ICartResponse;
  review?: ICheckoutReview;
  totalPrice: number;
  shippingFee: number;
  discountAmount?: number;
  couponCode?: string;
  isSubmitting: boolean;
  submitDisabled?: boolean;
}

const CheckoutSummary = forwardRef<HTMLElement, CheckoutSummaryProps>(
  (
    {
      cart,
      review,
      totalPrice,
      shippingFee,
      discountAmount = 0,
      couponCode,
      isSubmitting,
      submitDisabled,
    },
    ref
  ) => {
    const isFreeShipping = shippingFee <= 0;
    return (
      <aside
        ref={ref}
        data-testid="checkout-summary"
        className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24 bg-white border border-white-200 rounded-xl shadow-card p-6 md:p-7"
      >
        <h2 className="text-base font-bold mb-2">
          Đơn hàng
          <span className="ml-2 text-sm font-medium text-dark-400">
            · {cart.totalQuantity} sản phẩm
          </span>
        </h2>

        <div className="flex flex-col">
          {cart.items.map((item) => (
            <SummaryItem key={`product:${item.variantId}`} item={item} />
          ))}
          {review?.combos.map((line) => (
            <SummaryCombo key={`combo:${line.lineId}`} line={line} />
          ))}
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-dark-500 border-t border-white-500 pt-3.5 mt-2">
          <div className="flex justify-between">
            <span>{`Tạm tính (${cart.totalQuantity} sản phẩm)`}</span>
            <span className="font-semibold text-dark-800">
              {formatPrice(cart.totalOriginalPrice)}
            </span>
          </div>
          {cart.totalSavings > 0 && (
            <div className="flex justify-between">
              <span>Tiết kiệm</span>
              <span className="font-semibold text-terracotta">
                −{formatPrice(cart.totalSavings)}
              </span>
            </div>
          )}
          {couponCode && discountAmount > 0 && (
            <div className="flex justify-between gap-2">
              <span>Mã giảm giá {couponCode}</span>
              <span className="font-semibold text-terracotta">
                −{formatPrice(discountAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Vận chuyển</span>
            <span className="font-semibold text-dark-800">
              {isFreeShipping ? "Miễn phí" : formatPrice(shippingFee)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-baseline border-t border-white-500 pt-3.5 mt-3.5 mb-5">
          <span className="text-sm font-semibold">Tổng cộng</span>
          <span
            className="text-2xl font-extrabold"
            data-testid="checkout-total"
          >
            {formatPrice(totalPrice)}
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting || submitDisabled}
        >
          Đặt hàng
        </Button>
        {isFreeShipping && (
          <p className="text-xs text-dark-500 text-center mt-3">
            Miễn phí vận chuyển cho mọi đơn hàng
          </p>
        )}
      </aside>
    );
  }
);

CheckoutSummary.displayName = "CheckoutSummary";

export default CheckoutSummary;

function SummaryCombo({ line }: { line: ICheckoutReviewCombo }) {
  const pieceCount = line.pieces.reduce(
    (sum, piece) => sum + piece.itemQuantity,
    0
  );
  return (
    <div className="py-3 border-b border-white-500 border-dashed">
      <span className="bg-primary-100 text-primary-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
        {`COMBO · ${pieceCount} món`}
      </span>
      <div className="flex justify-between gap-3 mt-2 text-sm font-semibold">
        <p>
          {line.name} ×{line.quantity}
        </p>
        <span className="whitespace-nowrap">
          {formatPrice(line.price * line.quantity)}
        </span>
      </div>
      <div className="mt-3 ml-2 border-l-2 border-white-500 pl-3 flex flex-col gap-3">
        {line.pieces.map((piece) => (
          <div
            key={`${line.lineId}:${piece.productId}:${piece.variantId}`}
            className="flex items-center gap-3 text-sm"
          >
            {piece.image && (
              <Image
                src={piece.image}
                alt={piece.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg bg-white-100 object-cover shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium line-clamp-2">
                {piece.name} ×{piece.itemQuantity * line.quantity}
              </p>
              <p className="text-xs text-dark-500">
                {piece.attributeValues
                  .map((attribute) =>
                    /^\d+$/.test(attribute.value)
                      ? `${attribute.name} ${attribute.value}`
                      : attribute.value
                  )
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="font-semibold">
                {formatPrice(piece.lineTotal * line.quantity)}
              </span>
              <span className="text-xs text-dark-500 line-through">
                {formatPrice(piece.originalPrice * line.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryItem({ item }: { item: ICartItem }) {
  const attributeLabel = item.attributeValues
    .map((av) => (/^\d+$/.test(av.value) ? `${av.name} ${av.value}` : av.value))
    .filter(Boolean)
    .join(" · ");
  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 border-b border-white-300 last:border-b-0",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="relative w-16 aspect-square shrink-0 rounded-lg overflow-hidden bg-white-100">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            width={64}
            height={64}
            className="w-full h-full object-cover mix-blend-multiply"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
        <p className="text-xs text-dark-500 mt-0.5">
          {[attributeLabel, `×${item.quantity}`].filter(Boolean).join(" · ")}
        </p>
        {!item.isAvailable && (
          <p className="text-xs text-red mt-0.5">
            {unavailableReason(item)} — không tính
          </p>
        )}
      </div>
      <div
        className={cn(
          "text-right text-sm whitespace-nowrap",
          item.isAvailable
            ? "font-bold"
            : "font-normal text-dark-400 line-through"
        )}
      >
        {formatPrice(lineTotal)}
        {item.quantity > 1 && (
          <span className="block text-xs font-normal text-dark-400">
            {formatPrice(item.price)} × {item.quantity}
          </span>
        )}
      </div>
    </div>
  );
}
