"use client";

import { useMemo } from "react";
import { cn } from "@/config/utils";
import {
  IProductOption,
  IProductVariant,
  IVariantAttributeValue,
} from "@/@types/Product.type";

interface VariantSelectorProps {
  options: IProductOption[];
  variants: IProductVariant[];
  /** attributeId._id → attributeValueId đang chọn */
  selected: Record<string, string>;
  onSelect: (attributeId: string, valueId: string) => void;
}

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const VariantSelector = ({
  options,
  variants,
  selected,
  onSelect,
}: VariantSelectorProps) => {
  // Nhãn hiển thị của từng attributeValue lấy từ variants (options chỉ chứa id)
  const valueMap = useMemo(() => {
    const map = new Map<string, IVariantAttributeValue>();
    variants.forEach((variant) => {
      variant.attributeValues.forEach((av) => map.set(av._id, av));
    });
    return map;
  }, [variants]);

  // Value còn chọn được: tồn tại variant còn hàng chứa value này
  // VÀ khớp các nhóm khác đang chọn
  const isValueAvailable = (attributeId: string, valueId: string) => {
    return variants.some((variant) => {
      if (variant.inventoryCount <= 0) return false;
      const variantValueIds = variant.attributeValues.map((av) => av._id);
      if (!variantValueIds.includes(valueId)) return false;
      return Object.entries(selected).every(
        ([attrId, selectedValueId]) =>
          attrId === attributeId || variantValueIds.includes(selectedValueId)
      );
    });
  };

  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {options.map((option) => {
        const attrId = option.attributeId._id;
        return (
          <div key={attrId}>
            <p className="mb-2">{option.attributeId.name}</p>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((valueId) => {
                const attrValue = valueMap.get(valueId);
                // Value không xuất hiện ở variant ACTIVE nào → không bán, ẩn
                if (!attrValue) return null;

                const isSelected = selected[attrId] === valueId;
                const isAvailable = isValueAvailable(attrId, valueId);
                const isColor =
                  !!attrValue.meta && HEX_COLOR_REGEX.test(attrValue.meta);

                if (isColor) {
                  return (
                    <button
                      key={valueId}
                      type="button"
                      aria-label={attrValue.value}
                      title={attrValue.value}
                      disabled={!isAvailable}
                      onClick={() => onSelect(attrId, valueId)}
                      className={cn(
                        "w-6 h-6 rounded-full border border-white-500",
                        // outline màu cố định — outline theo màu swatch làm swatch trắng vô hình
                        isSelected &&
                          "outline outline-offset-2 outline-2 outline-dark-300",
                        !isAvailable && "opacity-30 cursor-not-allowed"
                      )}
                      style={{ backgroundColor: attrValue.meta }}
                    />
                  );
                }

                return (
                  <button
                    key={valueId}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => onSelect(attrId, valueId)}
                    className={cn(
                      "px-3 py-1 text-sm border rounded-md",
                      isSelected
                        ? "border-primary text-primary bg-primary-50"
                        : "border-white-500 text-dark",
                      !isAvailable &&
                        "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {attrValue.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantSelector;
