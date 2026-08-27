"use client";

import { useEffect, useState } from "react";
import { cn } from "@/config/utils";
import InputNumber from "@/components/ui/InputNumber";
import { Plus, Minus } from "@/components/icons";

interface CounterProps {
  defaultValue?: number;
  min?: number;
  max?: number;
  onChangeCount?: (count: number) => void;
  disabled?: boolean;
  className?: string;
  /** pill: 1 khung bo lg cao 40px, nút ghost bên trong (chốt C2 mockup buy-row) — dùng ở product detail */
  variant?: "split" | "pill";
}

const Counter = ({
  defaultValue = 0,
  onChangeCount,
  min = -Infinity,
  max = Infinity,
  disabled = false,
  className,
  variant = "split",
}: CounterProps) => {
  // Khởi tạo trong khoảng [min, max] (vd min=1 thì không bắt đầu ở 0)
  const [count, setCount] = useState<number>(() =>
    Math.min(Math.max(defaultValue, min), max)
  );

  // Clamp lại khi min/max thay đổi để count không vượt khoảng
  useEffect(() => {
    setCount((prev) => Math.min(Math.max(prev, min), max));
  }, [min, max]);

  const handleIncrement = () => {
    if (disabled || count >= max) return;
    const newCount = count + 1;
    handleChange(newCount);
  };

  const handleDecrement = () => {
    if (disabled || count <= min) return;
    handleChange(count - 1);
  };

  const handleChange = (value: number) => {
    if (disabled || value < min || value > max) return;
    setCount(value);
    onChangeCount?.(value);
  };

  return (
    <div
      className={cn(
        "flex items-center",
        variant === "pill" &&
          "h-10 overflow-hidden rounded-lg border border-white-600",
        className
      )}
    >
      <ButtonCounter
        onClick={handleDecrement}
        isDisabled={disabled || count <= min}
        variant={variant}
      />
      <InputNumber
        className={cn(
          "text-center outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:z-10 px-1",
          variant === "pill"
            ? "h-10 w-8 border-0 font-semibold focus-visible:ring-inset"
            : "h-10 w-12 border border-white-600 border-r-0 border-l-0"
        )}
        value={count}
        onChange={handleChange}
        isSpinButton={false}
        min={min}
        max={max}
        disabled={disabled}
      />
      <ButtonCounter
        isIncreaseButton
        onClick={handleIncrement}
        isDisabled={disabled || count >= max}
        variant={variant}
      />
    </div>
  );
};

export default Counter;

interface ButtonCounterProps {
  onClick: () => void;
  isDisabled?: boolean;
  isIncreaseButton?: boolean;
  variant?: "split" | "pill";
}

const ButtonCounter = ({
  onClick,
  isIncreaseButton,
  isDisabled,
  variant = "split",
}: ButtonCounterProps) => {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:z-10",
        variant === "pill"
          ? // ghost trong khung chung — focus ring vẽ vào trong để không bị overflow-hidden cắt
            "h-10 w-9 text-dark-500 focus-visible:ring-inset"
          : cn(
              "h-10 w-10 border bg-white border-white-600",
              isIncreaseButton ? "rounded-r-md" : "rounded-l-md"
            ),
        isDisabled
          ? "cursor-not-allowed text-dark-300 opacity-50"
          : variant === "pill"
            ? "cursor-pointer hover:bg-white-50 hover:text-primary-700"
            : "cursor-pointer hover:bg-white-50 hover:border-primary"
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isIncreaseButton ? <Plus /> : <Minus />}
    </button>
  );
};
