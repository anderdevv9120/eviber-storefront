"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { cn } from "@/config/utils";
import ItemPrice from "@/components/ui/ItemPrice";
import RatingStar from "@/components/ui/RatingStar";
import { PATH } from "@/constants/paths";
import type { ThemeProductCardProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Rút gọn số bán cho hàng meta hẹp: 1132 → "1,1k" (cùng quy ước DefaultProductCard)
const formatSoldCount = (count: number) =>
  count >= 1000
    ? `${(count / 1000).toFixed(1).replace(".", ",").replace(",0", "")}k`
    : count;

const CHIP = "px-2.5 py-0.5 text-xs font-extrabold text-white rounded-full";

function ProductCard({
  productItem,
  currentPriceClass,
  priceClass,
}: ThemeProductCardProps) {
  // price undefined = product chưa có variant ACTIVE nào (BE attachPreviewVariants)
  const isOutOfStock = productItem.price == null;
  const discountPercentage = productItem.discountPercentage ?? 0;
  const sold =
    productItem.soldCount != null
      ? `Đã bán ${formatSoldCount(productItem.soldCount)}`
      : null;

  return (
    <Link
      href={`${PATH.PRODUCT}/${productItem.slug}`}
      className="group/card flex flex-col h-full rounded-2xl bg-white p-2.5 shadow-card transition-shadow duration-300 hover:shadow-card-hover motion-safe:transition-[transform,box-shadow] motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
    >
      {/* aspect nằm ở giếng ảnh để card không sập khung khi image null */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white-100">
        {productItem.image && (
          <Image
            src={resolveImageUrl(productItem.image)}
            alt={productItem.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/card:scale-105"
          />
        )}
        <div className="absolute inset-x-2.5 top-2.5 flex items-center gap-2 pointer-events-none">
          {discountPercentage > 0 && (
            <span className={cn(CHIP, "bg-terracotta")}>
              -{discountPercentage}%
            </span>
          )}
          {isOutOfStock && (
            <span className={cn(CHIP, "bg-dark-300")}>Hết hàng</span>
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

      <div className="flex flex-col flex-1 px-1.5 pt-3 pb-1">
        <h3
          title={productItem.name}
          className="text-sm md:text-[15px] font-semibold text-ink line-clamp-2 break-words"
        >
          {productItem.name}
        </h3>

        {/* Sao + (số) chỉ khi có rating; list item không có số review → dùng số đã bán */}
        {productItem.rating != null ? (
          // flex-wrap: card hẹp (2 cột @390) đẩy số bán xuống dòng thay vì cắt "…"
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-dark-500">
            <RatingStar rating={productItem.rating} classStar="w-3 h-3" />
            {sold && <span className="whitespace-nowrap">({sold})</span>}
          </div>
        ) : (
          sold && (
            <p className="mt-1.5 text-xs text-dark-500 truncate">{sold}</p>
          )
        )}

        <div className="mt-auto pt-2">
          <ItemPrice
            price={productItem.price}
            originalPrice={productItem.originalPrice}
            currentPriceClass={cn(
              // Hết hàng: ItemPrice hiện "Đang cập nhật" — không tô như giá thật
              !isOutOfStock &&
                cn(
                  "text-base md:text-lg font-extrabold",
                  discountPercentage > 0 ? "text-terracotta" : "text-ink"
                ),
              currentPriceClass
            )}
            priceClass={cn("text-xs", priceClass)}
          />
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
