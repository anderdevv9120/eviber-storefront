"use client";

import Image from "next/image";
import { useState, memo, MouseEvent } from "react";
import { cn } from "@/config/utils";
import { Cart, Heart } from "@/components/icons";
import ItemPrice from "@/components/ui/ItemPrice";
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
      className="hover:shadow-md duration-300 cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-t-xl">
        {productItem.image && (
          <Image
            src={productItem.image}
            alt={productItem.name}
            priority
            width={300}
            height={300}
            className="w-[300px] h-[200px] object-cover rounded-t-xl transition-transform duration-300 hover:scale-105"
          />
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-0 left-0 px-4 py-1 font-normal text-white bg-red rounded-tl-xl rounded-br-xl">
            -{discountPercentage}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-0 left-0 px-4 py-1 font-normal text-white bg-dark-300 rounded-tl-xl rounded-br-xl">
            Hết hàng
          </div>
        )}

        <button
          type="button"
          className="absolute top-3 right-3 bg-dark-50 p-1 rounded-full hover:bg-dark-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
          aria-label="Yêu thích sản phẩm"
          aria-pressed={favorite}
          onClick={toggleFavorite}
        >
          <Heart
            className={cn(favorite ? "text-primary-800" : "text-dark-50")}
          />
        </button>
      </div>

      <div className="px-3 py-2 bg-white-100">
        <div className="flex items-center mb-2">
          <h2
            title={productItem.name}
            className="flex-1 min-h-12 text-base text-gray-700 line-clamp-2 text-ellipsis"
          >
            {productItem.name}
          </h2>
          <Cart className="min-w-5 ml-8 fill-none cursor-pointer stroke-[1.5px] hover:opacity-80" />
        </div>

        <ItemPrice
          price={productItem.price}
          originalPrice={productItem.originalPrice}
          currentPriceClass={currentPriceClass}
          priceClass={priceClass}
          isShowDiscountPrice={isShowDiscountPrice}
          isVertical={isVertical}
        />
      </div>
    </Link>
  );
};

export default memo(CardItem);
