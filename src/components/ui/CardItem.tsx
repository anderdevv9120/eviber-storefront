"use client";

import Image from "next/image";
import { useState, memo, MouseEvent } from "react";
import { cn } from "@/config/utils";
import { HeartOutline, Plus, Star } from "@/components/icons";
import ItemPrice from "@/components/ui/ItemPrice";
import RatingStar from "@/components/ui/RatingStar";
import { IProductListItem } from "@/@types/Product.type";
import Link from "next/link";

interface CardItemProps {
  productItem: IProductListItem;
  isShowDiscountPrice?: boolean;
  isVertical?: boolean;
  currentPriceClass?: string;
  priceClass?: string;
}

const CardItem = ({
  productItem,
  isShowDiscountPrice = false,
  isVertical = false,
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
      href={`/product/${productItem.slug}-${productItem._id}`}
      className="group/card block bg-white rounded-2xl border border-white-300 shadow-sm hover:shadow-md hover:border-white-500 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative overflow-hidden">
        {productItem.image && (
          <Image
            src={productItem.image}
            alt={productItem.name}
            width={400}
            height={533}
            className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 text-xs font-bold text-white bg-red rounded-full">
            -{discountPercentage}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 text-xs font-bold text-white bg-dark-300 rounded-full">
            Hết hàng
          </div>
        )}

        <button
          type="button"
          className="absolute top-2.5 right-2.5 flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-md cursor-pointer transition-all hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 md:opacity-0 md:group-hover/card:opacity-100 md:focus-visible:opacity-100"
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

      <div className="px-3.5 pt-3 pb-4">
        <h3
          title={productItem.name}
          className="min-h-10 md:min-h-12 text-dark-600 line-clamp-2 mb-1.5 group-hover/card:text-primary-700 transition-colors"
        >
          {productItem.name}
        </h3>

        {(productItem.rating != null || productItem.soldCount != null) && (
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-dark-400 whitespace-nowrap">
            {productItem.rating != null && (
              <>
                {/* Mobile compact: 1 sao + điểm (card ~170px không đủ chỗ cho 5 sao) */}
                <span className="flex items-center gap-0.5 md:hidden">
                  <Star className="w-3 h-3 text-yellow-300" />
                  {productItem.rating}
                </span>
                <span className="hidden md:block">
                  <RatingStar rating={productItem.rating} classStar="w-3 h-3" />
                </span>
              </>
            )}
            {productItem.soldCount != null && (
              <span>
                {productItem.rating != null && "· "}Đã bán{" "}
                {productItem.soldCount}
              </span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between gap-2">
          <ItemPrice
            price={productItem.price}
            originalPrice={productItem.originalPrice}
            currentPriceClass={cn(
              // Hết hàng: ItemPrice hiện "Đang cập nhật" — không tô như giá thật
              !isOutOfStock && "text-primary-700 font-bold",
              currentPriceClass
            )}
            priceClass={priceClass}
            isShowDiscountPrice={isShowDiscountPrice}
            isVertical={isVertical}
          />
          {/* Shortcut điều hướng (đã chốt) — KHÔNG add-to-cart vì cart thao tác theo variant */}
          {!isOutOfStock && (
            <span
              aria-hidden
              className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full bg-primary text-white group-hover/card:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default memo(CardItem);
