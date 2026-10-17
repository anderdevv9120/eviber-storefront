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
  // Nhãn nhỏ trên tên (IProductListItem không có danh mục): hết hàng > giảm giá > không có
  const label = isOutOfStock
    ? "Hết hàng"
    : discountPercentage > 0
      ? `Giảm ${discountPercentage}%`
      : null;

  return (
    <Link
      href={`${PATH.PRODUCT}/${productItem.slug}`}
      className="group/card block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
    >
      {/* aspect nằm ở giếng ảnh để card không sập khung khi image null */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white-100">
        {productItem.image && (
          <Image
            src={resolveImageUrl(productItem.image)}
            alt={productItem.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover/card:scale-[1.04]"
          />
        )}
        {/* Nhãn trang trí — tên sản phẩm đã là accessible name của link */}
        <span
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 rounded-full bg-page py-2 text-center text-sm font-medium text-ink opacity-0 transition-opacity duration-300 motion-safe:translate-y-2 motion-safe:transition motion-safe:group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:opacity-100"
        >
          Xem chi tiết
        </span>
      </div>

      <div className="pt-3.5">
        {/* Luôn giữ dòng nhãn (rỗng khi không có) để tên các card trong lưới thẳng hàng */}
        <p
          className={cn(
            "mb-1 h-4 text-[11px] leading-4 font-semibold uppercase tracking-[0.12em]",
            isOutOfStock ? "text-dark-500" : "text-terracotta"
          )}
        >
          {label}
        </p>
        <h3
          title={productItem.name}
          className="font-display text-[17px] leading-snug text-ink line-clamp-2 break-words mb-1.5"
        >
          {productItem.name}
        </h3>

        <ItemPrice
          price={productItem.price}
          originalPrice={productItem.originalPrice}
          currentPriceClass={cn(
            // Hết hàng: ItemPrice hiện "Đang cập nhật" — không tô như giá thật
            !isOutOfStock && "text-[15px] font-semibold text-terracotta",
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
