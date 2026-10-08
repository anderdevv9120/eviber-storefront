import { forwardRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { cn } from "@/config/utils";
import { formatPrice } from "@/utils/formatPrice";
import { ICartItem, ICartResponse } from "@/@types/Cart.type";

interface CheckoutSummaryProps {
  cart: ICartResponse;
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
            <SummaryItem key={item.variantId} item={item} />
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
          <p className="text-xs text-red mt-0.5">Tạm hết hàng — không tính</p>
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
