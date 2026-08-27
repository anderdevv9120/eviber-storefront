"use client";

import Image from "next/image";
import { useState, memo, MouseEvent } from "react";
import { cn } from "@/config/utils";
import { HeartOutline, Plus, Star } from "@/components/icons";
import ItemPrice from "@/components/ui/ItemPrice";
import { IProductListItem } from "@/@types/Product.type";
import { PATH } from "@/constants/paths";
import Link from "next/link";

interface CardItemProps {
  productItem: IProductListItem;
  currentPriceClass?: string;
  priceClass?: string;
}

// Rút gọn số bán cho hàng meta hẹp: 1132 → "1,1k"; phần thập phân 0 bỏ luôn (1000 → "1k")
const formatSoldCount = (count: number) =>
  count >= 1000
    ? `${(count / 1000).toFixed(1).replace(".", ",").replace(",0", "")}k`
    : count;

const CardItem = ({
  productItem,
  currentPriceClass,
  priceClass,
}: CardItemProps) => {
  const [favorite, setFavorite] = useState(false);

  // price undefined = product chưa có variant ACTIVE nào (BE attachPreviewVariants)
  const isOutOfStock = productItem.price == null;
  const discountPercentage = productItem.discountPercentage ?? 0;

  const toggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    // Nút nằm trong <Link> nên phải chặn điều hướng khi bấm
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
  };

  return (
    <Link
      href={`${PATH.PRODUCT}/${productItem.slug}`}
      className="group/card block bg-white rounded-xl border border-white-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative overflow-hidden bg-white-100">
        {productItem.image && (
          <Image
            src={productItem.image}
            alt={productItem.name}
            width={400}
            height={533}
            className="w-full aspect-[3/4] object-cover mix-blend-multiply transition-transform duration-500 group-hover/card:scale-105"
          />
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-xs font-semibold text-white bg-terracotta rounded-md">
            -{discountPercentage}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-xs font-semibold text-white bg-dark-300 rounded-md">
            Hết hàng
          </div>
        )}

        <button
          type="button"
          className="absolute top-2.5 right-2.5 flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-md cursor-pointer transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 after:absolute after:-inset-1.5 after:content-['']"
          aria-label="Yêu thích sản phẩm"
          aria-pressed={favorite}
          onClick={toggleFavorite}
        >
          <HeartOutline
            className={cn(
              "w-[18px] h-[18px]",
              favorite ? "text-red" : "text-dark-500"
            )}
          />
        </button>
      </div>

      <div className="px-2.5 md:px-3.5 pt-3 pb-3.5">
        <h3
          title={productItem.name}
          className="text-sm font-semibold text-dark-800 line-clamp-1 mb-2 group-hover/card:text-primary-700 transition-colors"
        >
          {productItem.name}
        </h3>

        {/* Giá + giá gạch CÙNG 1 hàng làm anchor đáy card (layout M2 đã chốt) */}
        <ItemPrice
          price={productItem.price}
          originalPrice={productItem.originalPrice}
          currentPriceClass={cn(
            // Hết hàng: ItemPrice hiện "Đang cập nhật" — không tô như giá thật.
            // Giá near-black; chỉ chuyển terracotta khi đang giảm (accent sale)
            !isOutOfStock &&
              cn(
                "text-base md:text-lg font-bold",
                discountPercentage > 0 ? "text-terracotta" : "text-dark-800"
              ),
            currentPriceClass
          )}
          priceClass={cn("text-xs", priceClass)}
        />

        {/* Hàng cuối 2 cực: social proof trái / nút điều hướng phải — lấp trục ngang */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-xs text-dark-400 whitespace-nowrap truncate">
            {/* Rating chỉ từ md — card mobile 2 cột không đủ chỗ cả rating lẫn số bán */}
            {productItem.rating != null && (
              <span className="font-semibold">
                <Star className="inline w-3 h-3 text-yellow-500 align-[-2px]" />{" "}
                {productItem.rating}
                {productItem.soldCount != null && " · "}
              </span>
            )}
            {productItem.soldCount != null &&
              `Đã bán ${formatSoldCount(productItem.soldCount)}`}
          </span>

          {/* Shortcut điều hướng (đã chốt) — KHÔNG add-to-cart vì cart thao tác theo variant */}
          {!isOutOfStock && (
            <span
              aria-hidden
              className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-primary text-white hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default memo(CardItem);
