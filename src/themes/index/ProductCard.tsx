"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { cn } from "@/config/utils";
import ItemPrice from "@/components/ui/ItemPrice";
import { PATH } from "@/constants/paths";
import type { ThemeProductCardProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

function ProductCard({
  productItem,
  currentPriceClass,
  priceClass,
}: ThemeProductCardProps) {
  const isOutOfStock = productItem.price == null;
  return (
    <Link
      href={`${PATH.PRODUCT}/${productItem.slug}`}
      className="group/card block min-w-0 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden bg-white-100">
        {productItem.image && (
          <Image
            src={resolveImageUrl(productItem.image)}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 text-xs font-semibold">
          {productItem.discountPercentage != null &&
            productItem.discountPercentage > 0 && (
              <span className="bg-ink px-2 py-1 text-white tabular-nums">
                -{productItem.discountPercentage}%
              </span>
            )}
          {isOutOfStock && (
            <span className="bg-ink px-2 py-1 text-white">Hết hàng</span>
          )}
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-ink py-3 text-center text-sm font-semibold text-white opacity-0 motion-safe:transition-opacity group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
        >
          Xem chi tiết
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-ink py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-3">
        <h3
          title={productItem.name}
          className="line-clamp-2 break-words text-sm font-medium leading-relaxed"
        >
          {productItem.name}
        </h3>
        <div className="tabular-nums lg:max-w-[130px] lg:text-right">
          <ItemPrice
            price={productItem.price}
            originalPrice={productItem.originalPrice}
            isVertical
            currentPriceClass={cn(
              "text-sm font-semibold",
              isOutOfStock ? "text-dark-500" : "text-ink",
              currentPriceClass
            )}
            priceClass={cn("text-xs", priceClass)}
          />
        </div>
      </div>
      {(productItem.rating != null || productItem.soldCount != null) && (
        <p className="pb-3 text-xs leading-relaxed text-dark-500 tabular-nums">
          {productItem.rating != null && `★ ${productItem.rating}`}
          {productItem.rating != null && productItem.soldCount != null && " · "}
          {productItem.soldCount != null &&
            `Đã bán ${productItem.soldCount.toLocaleString("vi-VN")}`}
        </p>
      )}
    </Link>
  );
}

export default memo(ProductCard);
