"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SvgIcon from "@/components/ui/SvgIcon";
import Button from "@/components/ui/Button";
import Counter from "@/components/ui/Counter";
import ItemPrice from "@/components/ui/ItemPrice";
import VariantSelector from "./VariantSelector";
import FlashSale from "./FlashSale";
import { IProductOption, IProductVariant } from "@/@types/Product.type";
import { PATH } from "@/constants/paths";
import { addToCart } from "@/apis/cart";
import { useCartStore } from "@/store/useCartStore";
import { successToast } from "@/utils/toast";
import { cn } from "@/config/utils";
import useProductGalleryStore from "@/store/useProductGalleryStore";

interface ProductFormProps {
  options: IProductOption[];
  variants: IProductVariant[];
}

/** Tồn ≤ ngưỡng này thì dòng tồn kho chuyển giọng khan hiếm ("Chỉ còn N") */
const LOW_STOCK_THRESHOLD = 5;

const buildInitialSelection = (variants: IProductVariant[]) => {
  const initialVariant =
    variants.find((v) => v.inventoryCount > 0) ?? variants[0];
  if (!initialVariant) return {};
  return Object.fromEntries(
    initialVariant.attributeValues.map((av) => [av.attributeId, av._id])
  );
};

const ProductForm = ({ options, variants }: ProductFormProps) => {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    buildInitialSelection(variants)
  );
  const [quantity, setQuantity] = useState(1);

  // Variant khớp toàn bộ selection hiện tại (product không option → variant đầu)
  const selectedVariant = useMemo(() => {
    if (options.length === 0) return variants[0];
    return variants.find((variant) => {
      const variantValueIds = variant.attributeValues.map((av) => av._id);
      return options.every((option) => {
        const selectedValueId = selected[option.attributeId._id];
        return selectedValueId && variantValueIds.includes(selectedValueId);
      });
    });
  }, [variants, options, selected]);

  const inventoryCount = selectedVariant?.inventoryCount ?? 0;
  const canBuy = !!selectedVariant && inventoryCount > 0;
  const discountPercentage = selectedVariant?.discountPercentage ?? 0;

  const setVariantImage = useProductGalleryStore((s) => s.setVariantImage);
  const variantImage = selectedVariant?.image ?? null;
  useEffect(() => {
    setVariantImage(variantImage);
  }, [variantImage, setVariantImage]);
  // Reset khi rời trang — store module-level, không reset là ảnh variant cũ
  // rò sang sản phẩm xem sau
  useEffect(() => {
    return () => setVariantImage(null);
  }, [setVariantImage]);

  const handleSelect = (attributeId: string, valueId: string) => {
    setSelected((prev) => ({ ...prev, [attributeId]: valueId }));
    setQuantity(1);
  };

  // Khóa CẢ 2 CTA khi request đang bay — BE addToCart CỘNG DỒN quantity nên
  // double-click là giỏ nhận gấp đôi âm thầm
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClickAddToCart = async () => {
    if (!selectedVariant || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addToCart({ variantId: selectedVariant.id, quantity });
      useCartStore.getState().fetchCart(true);
      successToast("Thêm vào giỏ hàng thành công");
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mua ngay = thêm giỏ rồi sang thẳng /cart (chốt buy-row) — lỗi addToCart đã có
  // interceptor toast, không điều hướng khi thất bại
  const handleClickBuyNow = async () => {
    if (!selectedVariant || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addToCart({ variantId: selectedVariant.id, quantity });
      useCartStore.getState().fetchCart(true);
      router.push(PATH.CART);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variants.length === 0) {
    return (
      <p className="my-6 text-dark-400">
        Sản phẩm hiện chưa có hàng để bán. Vui lòng quay lại sau.
      </p>
    );
  }

  return (
    <>
      {/* Giá LUÔN là price row đứng riêng (sale = đổi màu + badge, đồng bộ CardItem);
          flash sale chỉ còn strip countdown mảnh bên dưới — chốt vòng /ui-audit */}
      {/* Nhịp cột phải 3 nấc (đo /ui-audit vòng spacing): 24px giữa các block chính,
          16px giữa 2 nhóm option, 8px label→chips; từ lg nới 1 nấc (32/24) — USP đã
          rời cột nên content thấp hơn ảnh 560, nới nhịp cho cột thở */}
      {/* Giá thấp hơn title 1 nấc (title 3xl) — độ nổi đến từ màu + vị trí, tránh
          2 "đỉnh" cùng cỡ khi không sale (/ui-audit header). gap-1.5 khớp gap nội bộ ItemPrice */}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 mt-6 mb-2">
        <ItemPrice
          price={selectedVariant?.price}
          originalPrice={selectedVariant?.originalPrice}
          currentPriceClass={cn(
            "text-xl md:text-2xl font-bold",
            discountPercentage > 0 ? "text-terracotta" : "text-dark-800"
          )}
          priceClass="text-base"
        />
        {discountPercentage > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-terracotta rounded-md">
            -{discountPercentage}%
          </span>
        )}
      </div>
      {discountPercentage > 0 && (
        <div className="mt-2">
          <FlashSale />
        </div>
      )}

      {/* SKU là mã CMS không show khách */}
      <div className="mt-6 lg:mt-8">
        <VariantSelector
          options={options}
          variants={variants}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* Hàng mua A1 (chốt mobile-refine): hàng 1 counter pill + tồn kho, CTA hàng dưới nhường trọn bề ngang */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0 mt-6 lg:mt-8">
        <span className="text-sm font-bold">Số lượng</span>
        <Counter
          key={selectedVariant?.id ?? "none"}
          defaultValue={1}
          min={1}
          max={Math.max(inventoryCount, 1)}
          onChangeCount={setQuantity}
          disabled={!canBuy}
          variant="pill"
        />
        {/* Khan hiếm: tồn thấp đổi giọng + màu sale để thúc quyết định (chốt vòng mobile-refine) */}
        {canBuy ? (
          inventoryCount <= LOW_STOCK_THRESHOLD ? (
            <span className="text-sm font-semibold text-terracotta">
              Chỉ còn {inventoryCount} sản phẩm
            </span>
          ) : (
            <span className="text-sm text-dark-500">
              Còn {inventoryCount} sản phẩm
            </span>
          )
        ) : (
          <span className="text-sm text-dark-500">
            Phân loại này đã hết hàng
          </span>
        )}
      </div>

      {/* CTA: mobile 2 nút xếp dọc full-width (Mua ngay trên — chốt A1);
          từ sm về 1 hàng chia đôi, Thêm giỏ đứng trái */}
      <div className="flex flex-col sm:flex-row items-stretch gap-4 mt-4 lg:mt-6">
        <Button
          size="lg"
          className="min-w-0 sm:flex-1 px-2 sm:order-2"
          onClick={handleClickBuyNow}
          disabled={!canBuy || isSubmitting}
          loading={isSubmitting}
        >
          Mua ngay
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="min-w-0 sm:flex-1 px-2 sm:order-1"
          onClick={handleClickAddToCart}
          disabled={!canBuy || isSubmitting}
        >
          <SvgIcon name="cart-outline" className="w-5 h-5 shrink-0" />
          Thêm vào giỏ hàng
        </Button>
      </div>
    </>
  );
};

export default ProductForm;
