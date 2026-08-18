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
      <span className={cn("text-sm text-gray-500", currentPriceClass)}>
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
        isVertical ? "flex-col justify-between" : "justify-start"
      )}
    >
      <span
        className={cn(
          "text-primary-600 text-base mr-2 font-semibold",
          currentPriceClass
        )}
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span
          className={cn(
            "h-5 text-dark-200 text-sm w-20 mr-3 line-through",
            priceClass
          )}
        >
          {formatPrice(originalPrice)}
        </span>
      )}

      {isShowDiscountPrice && hasDiscount && (
        <p className={cn("text-red text-sm italic", priceClass)}>
          (Tiết kiệm {formatPrice(savings)})
        </p>
      )}
    </div>
  );
};

export default memo(ItemPrice);
