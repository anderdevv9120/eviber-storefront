"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IOrderProduct } from "@/@types/Order.type";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import { formatPrice } from "@/utils/formatPrice";

const FALLBACK_IMAGE = "/images/EmptyCollection.jpg";

const attributeLabel = (product: IOrderProduct) =>
  (product.attributeValuesAtOrder ?? [])
    .map((attribute) => attribute.value)
    .filter(Boolean)
    .join(" · ");

interface OrderProductLineProps {
  product: IOrderProduct;
  /** Trang chi tiết hiện thêm SKU; card danh sách thì không, cho đỡ rối */
  showSku?: boolean;
  className?: string;
}

const OrderProductLine = ({
  product,
  showSku,
  className,
}: OrderProductLineProps) => {
  // Ảnh snapshot trỏ URL ngoài, link chết là chuyện thường với đơn cũ. Phải đổi qua
  // state chứ không gán e.currentTarget.src: next/image có srcSet nên đổi src trần
  // không thắng được srcSet, ảnh vẫn hiện icon vỡ.
  const [imageSrc, setImageSrc] = useState(
    product.variantImageAtOrder || FALLBACK_IMAGE
  );
  const variant = attributeLabel(product);
  const meta = [variant, showSku && product.variantSkuAtOrder]
    .filter(Boolean)
    .join(" · ");
  // Đơn tạo trước khi BE snapshot slug thì đi bằng ObjectId — PDP tự resolve rồi
  // redirect về URL slug canonical
  const productPath = `${PATH.PRODUCT}/${
    product.productSlugAtOrder ?? product.productId
  }`;

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <Link href={productPath} className="flex-none" tabIndex={-1}>
        <Image
          src={imageSrc}
          alt={product.productNameAtOrder ?? "Sản phẩm"}
          width={144}
          height={144}
          className="h-16 w-16 rounded-md border border-white-300 object-cover sm:h-[72px] sm:w-[72px]"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={productPath}
          className="line-clamp-2 font-semibold hover:underline"
        >
          {product.productNameAtOrder ?? "Sản phẩm"}
        </Link>
        {meta && <p className="mt-0.5 text-sm text-dark-400">{meta}</p>}
      </div>

      <div className="flex-none text-right">
        <p className="font-semibold">{formatPrice(product.priceAtOrder)}</p>
        <p className="text-sm text-dark-400">×{product.quantity}</p>
      </div>
    </div>
  );
};

export default OrderProductLine;
