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
        // Label kèm tên value đang chọn — chốt C2 vòng refine; tồn kho đã chuyển
        // về hàng counter (chốt buy-row)
        const selectedValue = valueMap.get(selected[attrId] ?? "");
        return (
          <div key={attrId}>
            <p className="mb-2 text-sm font-bold">
              {option.attributeId.name}
              {selectedValue && (
                <span className="font-bold text-dark-400">
                  : {selectedValue.value}
                </span>
              )}
            </p>
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
                        // relative + after: hit-area ~44px mobile, visual giữ 32px.
                        // m-0.5: outline-offset ăn 3px mỗi bên, gap-2 trần làm 2 ring sát nhau.
                        // border white-600: swatch màu sáng (trắng/be) không tàng hình trên nền trắng
                        "relative w-8 h-8 m-0.5 rounded-full border border-white-600 after:absolute after:-inset-1.5 after:content-['']",
                        // outline màu cố định — outline theo màu swatch làm swatch trắng vô hình
                        isSelected
                          ? "outline outline-offset-2 outline-2 outline-primary-600"
                          : "outline outline-offset-2 outline-1 outline-white-600",
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
                      "min-w-[46px] px-3.5 py-2.5 text-sm font-semibold border rounded-lg text-center transition-colors",
                      isSelected
                        ? "border-primary-600 text-primary-700 bg-primary-50"
                        : "border-white-600 text-dark-600 hover:border-primary-300",
                      !isAvailable &&
                        "opacity-40 cursor-not-allowed line-through bg-white-100 hover:border-white-600"
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
