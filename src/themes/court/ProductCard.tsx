"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { cn } from "@/config/utils";
import { Star } from "@/components/icons";
import ItemPrice from "@/components/ui/ItemPrice";
import { PATH } from "@/constants/paths";
import type { ThemeProductCardProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Rút gọn số bán cho hàng meta hẹp: 1132 → "1,1k" (cùng quy ước DefaultProductCard)
const formatSoldCount = (count: number) =>
  count >= 1000
    ? `${(count / 1000).toFixed(1).replace(".", ",").replace(",0", "")}k`
    : count;

function ProductCard({
  productItem,
  currentPriceClass,
  priceClass,
}: ThemeProductCardProps) {
  // price undefined = product chưa có variant ACTIVE nào (BE attachPreviewVariants)
  const isOutOfStock = productItem.price == null;
  const discountPercentage = productItem.discountPercentage ?? 0;

  return (
    <Link
      href={`${PATH.PRODUCT}/${productItem.slug}`}
      className="group/card block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      {/* aspect nằm ở giếng ảnh để card không sập khung khi image null */}
      <div className="relative aspect-square overflow-hidden rounded-md bg-white-100">
        {productItem.image && (
          <Image
            src={resolveImageUrl(productItem.image)}
            alt={productItem.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/card:scale-105 motion-safe:group-hover/card:-rotate-3"
          />
        )}
        <div className="absolute inset-x-2.5 top-2.5 flex items-center gap-2 pointer-events-none">
          {discountPercentage > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold text-ink bg-[rgb(var(--theme-accent))] rounded-sm">
              -{discountPercentage}%
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 text-xs font-semibold text-white bg-dark-300 rounded-sm">
              Hết hàng
            </span>
          )}
        </div>
        {/* Nhãn trang trí — tên sản phẩm đã là accessible name của link */}
        <span
          aria-hidden="true"
          className="absolute inset-x-2.5 bottom-2.5 rounded-full bg-ink py-2 text-center text-sm font-semibold text-white opacity-0 transition-opacity duration-300 motion-safe:translate-y-2 motion-safe:transition motion-safe:group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
        >
          Xem chi tiết
        </span>
      </div>

      <div className="pt-3">
        <h3
          title={productItem.name}
          className="text-sm font-semibold text-ink line-clamp-2 break-words mb-1.5"
        >
          {productItem.name}
        </h3>

        <ItemPrice
          price={productItem.price}
          originalPrice={productItem.originalPrice}
          currentPriceClass={cn(
            // Hết hàng: ItemPrice hiện "Đang cập nhật" — không tô như giá thật
            !isOutOfStock &&
              cn(
                "text-base md:text-lg font-bold",
                discountPercentage > 0 ? "text-terracotta" : "text-ink"
              ),
            currentPriceClass
          )}
          priceClass={cn("text-xs", priceClass)}
        />

        {(productItem.rating != null || productItem.soldCount != null) && (
          <p className="mt-1.5 text-xs text-dark-500 whitespace-nowrap truncate">
            {productItem.rating != null && (
              <>
                <span className="font-semibold">
                  <Star className="inline w-3 h-3 text-yellow-500 align-[-2px]" />{" "}
                  {productItem.rating}
                </span>
                {productItem.soldCount != null && " · "}
              </>
            )}
            {productItem.soldCount != null &&
              `Đã bán ${formatSoldCount(productItem.soldCount)}`}
          </p>
        )}
      </div>
    </Link>
  );
}

export default memo(ProductCard);
