import { formatPrice } from "@/utils/formatPrice";
import { cn } from "@/config/utils";
import { memo } from "react";

type ItemPriceProps = {
  /** Giá bán thật (BE variant.price / preview variant) — undefined khi chưa có variant */
  price?: number;
  /** Giá gốc — hiện gạch ngang khi > price */
  originalPrice?: number;
  isShowDiscountPrice?: boolean;
  isVertical?: boolean;
  currentPriceClass?: string;
  priceClass?: string;
};

const ItemPrice = ({
  price,
  originalPrice,
  isShowDiscountPrice = false,
  isVertical = false,
  currentPriceClass,
  priceClass,
}: ItemPriceProps) => {
  if (price == null) {
    return (
      <span className={cn("text-sm text-dark-400", currentPriceClass)}>
        Đang cập nhật
      </span>
    );
  }

  const hasDiscount = originalPrice != null && originalPrice > price;
  const savings = hasDiscount ? originalPrice - price : 0;

  return (
    <div
      className={cn(
        "flex",
        isVertical
          ? "flex-col justify-between"
          : "flex-wrap items-baseline gap-x-1.5"
      )}
    >
      <span
        className={cn(
          "text-primary-600 text-base font-semibold",
          currentPriceClass
        )}
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className={cn("text-dark-400 text-sm line-through", priceClass)}>
          {formatPrice(originalPrice)}
        </span>
      )}

      {isShowDiscountPrice && hasDiscount && (
        <p className={cn("text-terracotta text-sm italic", priceClass)}>
          (Tiết kiệm {formatPrice(savings)})
        </p>
      )}
    </div>
  );
};

export default memo(ItemPrice);
