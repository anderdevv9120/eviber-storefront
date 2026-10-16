"use client";

import Image from "next/image";
import { memo } from "react";
import { cn } from "@/config/utils";
import { Star } from "@/components/icons";
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
  // price undefined = product chưa có variant ACTIVE nào (BE attachPreviewVariants)
  const isOutOfStock = productItem.price == null;
  const discountPercentage = productItem.discountPercentage ?? 0;

  return (
    <Link
      href={`${PATH.PRODUCT}/${productItem.slug}`}
      className="group/card block bg-white rounded-xl border border-white-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      {/* aspect nằm ở wrapper để card không sập khung khi image null */}
      <div className="relative overflow-hidden bg-white-100 aspect-[3/4]">
        {productItem.image && (
          <Image
            src={productItem.image}
            alt={productItem.name}
            width={400}
            height={533}
            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover/card:scale-105"
          />
        )}
        <div className="absolute inset-x-2.5 top-2.5 flex items-center gap-2 pointer-events-none">
          {discountPercentage > 0 && (
            <div className="px-2 py-0.5 text-xs font-semibold text-white bg-terracotta rounded-md">
              -{discountPercentage}%
            </div>
          )}
          {isOutOfStock && (
            <div className="px-2 py-0.5 text-xs font-semibold text-white bg-dark-300 rounded-md">
              Hết hàng
            </div>
          )}
        </div>
      </div>

      <div className="px-2.5 md:px-3.5 pt-3 pb-3.5">
        <h3
          title={productItem.name}
          className="text-sm font-semibold text-dark-800 line-clamp-1 mb-2 group-hover/card:text-primary-700 transition-colors"
        >
          {productItem.name}
        </h3>

        {/* Giá + giá gạch CÙNG 1 hàng làm anchor đáy card */}
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

        <p className="mt-2.5 text-xs text-dark-500 whitespace-nowrap truncate">
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
      </div>
    </Link>
  );
};

export default memo(CardItem);
