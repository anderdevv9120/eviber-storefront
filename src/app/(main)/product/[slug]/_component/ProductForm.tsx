"use client";

import { useMemo, useState } from "react";
import { CartPlus } from "@/components/icons";
import Button from "@/components/ui/Button";
import Counter from "@/components/ui/Counter";
import ItemPrice from "@/components/ui/ItemPrice";
import VariantSelector from "./VariantSelector";
import { IProductOption, IProductVariant } from "@/@types/Product.type";
import { addToCart } from "@/apis/cart";
import { successToast } from "@/utils/toast";

interface ProductFormProps {
  options: IProductOption[];
  variants: IProductVariant[];
}

const buildInitialSelection = (variants: IProductVariant[]) => {
  const initialVariant =
    variants.find((v) => v.inventoryCount > 0) ?? variants[0];
  if (!initialVariant) return {};
  return Object.fromEntries(
    initialVariant.attributeValues.map((av) => [av.attributeId, av._id])
  );
};

const ProductForm = ({ options, variants }: ProductFormProps) => {
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

  const handleSelect = (attributeId: string, valueId: string) => {
    setSelected((prev) => ({ ...prev, [attributeId]: valueId }));
    setQuantity(1);
  };

  const handleClickAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addToCart({ variantId: selectedVariant.id, quantity });
      successToast("Thêm vào giỏ hàng thành công");
    } catch {}
  };

  const handleClickBuyNow = () => {};

  if (variants.length === 0) {
    return (
      <p className="my-6 text-gray-500">
        Sản phẩm hiện chưa có hàng để bán. Vui lòng quay lại sau.
      </p>
    );
  }

  return (
    <>
      <ItemPrice
        price={selectedVariant?.price}
        originalPrice={selectedVariant?.originalPrice}
        currentPriceClass="text-xl"
        isShowDiscountPrice={true}
      />

      <div className="my-6">
        <VariantSelector
          options={options}
          variants={variants}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {selectedVariant && (
        <p className="mb-4 text-sm text-gray-500">
          SKU: {selectedVariant.sku} ·{" "}
          {inventoryCount > 0 ? `Còn ${inventoryCount} sản phẩm` : "Hết hàng"}
        </p>
      )}

      <div className="mb-10">
        <p className="mb-1">Số lượng</p>
        <Counter
          key={selectedVariant?.id ?? "none"}
          defaultValue={1}
          min={1}
          max={Math.max(inventoryCount, 1)}
          onChangeCount={setQuantity}
        />
      </div>

      <div className="flex justify-between gap-6">
        <Button
          variant="outlined"
          className="w-1/2 font-normal"
          onClick={handleClickAddToCart}
          disabled={!canBuy}
        >
          <CartPlus /> THÊM VÀO GIỎ HÀNG
        </Button>
        <Button
          className="w-1/2 font-normal"
          onClick={handleClickBuyNow}
          disabled={!canBuy}
        >
          MUA NGAY
        </Button>
      </div>
    </>
  );
};

export default ProductForm;
