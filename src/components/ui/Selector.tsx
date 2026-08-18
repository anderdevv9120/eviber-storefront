"use client";

import { useState } from "react";
import { cn } from "@/config/utils";

interface SelectorItemProps {
  label: string;
  value: BaseValueInputType;
  isAvailable?: boolean | true;
}

interface SelectorProps<T extends BaseValueType> {
  options: SelectorItemProps[];
  value?: T;
  defaultValue?: T;
  onChange?: (selectedValue: T, selectedItem: SelectorItemProps) => void;
}

const Selector = <T extends BaseValueType>({
  options,
  value,
  defaultValue,
  onChange,
}: SelectorProps<T>) => {
  const [selectedValue, setSelectedValue] =
    useState<BaseValueType>(defaultValue);
  const isHaveValue = value !== undefined;
  const formatSelectedValue = isHaveValue ? value : selectedValue;

  const handleClick = (item: SelectorItemProps) => {
    // Chặn chọn item không khả dụng (không chỉ dựa vào CSS)
    if (item.isAvailable === false) return;

    onChange?.(item.value as T, item);

    // Chỉ tự quản state khi uncontrolled để tránh 2 nguồn dữ liệu
    if (!isHaveValue) {
      setSelectedValue(item.value);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options?.map((item, index) => (
        <button
          key={index}
          type="button"
          className={cn(
            "cursor-pointer px-4 py-1 border rounded-sm select-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
            item.value === formatSelectedValue
              ? "border-primary text-primary-700"
              : "hover:border-primary border-white-400",
            item.isAvailable === false && "opacity-50 cursor-not-allowed"
          )}
          disabled={item.isAvailable === false}
          aria-pressed={item.value === formatSelectedValue}
          onClick={() => handleClick(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Selector;
