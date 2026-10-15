"use client";

import { useState } from "react";
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
  /**
   * sm: cao 32px cho chỗ chật; md: 40px mặc định; sm-md: sm dưới breakpoint md,
   * md từ md trở lên — CSS-only, không JS đo viewport (đo bằng useMediaQuery là
   * render md rồi co về sm sau hydrate, hàng giật cao độ mỗi lần load mobile)
   */
  size?: "sm" | "md" | "sm-md";
}

const Counter = ({
  defaultValue = 0,
  onChangeCount,
  min = -Infinity,
  max = Infinity,
  disabled = false,
  className,
  variant = "split",
  size = "md",
}: CounterProps) => {
  // Khởi tạo trong khoảng [min, max] (vd min=1 thì không bắt đầu ở 0)
  const [count, setCount] = useState<number>(() =>
    Math.min(Math.max(defaultValue, min), max)
  );

  // Clamp lại khi min/max thay đổi để count không vượt khoảng
  const clampedCount = Math.min(Math.max(count, min), max);
  if (!Object.is(count, clampedCount)) {
    setCount(clampedCount);
  }

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
    // Counter đếm số nguyên nhưng NUMBER_REGEX của InputNumber cho gõ thập phân
    // ("1.5") — BE @IsNumber(maxDecimalPlaces:0) sẽ reject 400
    const intValue = Math.trunc(value);
    if (disabled || intValue < min || intValue > max) return;
    setCount(intValue);
    onChangeCount?.(intValue);
  };

  const sizeCls = (sm: string, md: string, smMd: string) =>
    size === "sm" ? sm : size === "sm-md" ? smMd : md;

  return (
    <div
      className={cn(
        "flex items-center",
        variant === "pill" &&
          cn(
            "rounded-lg border border-white-600",
            sizeCls("h-8", "h-10", "h-8 md:h-10")
          ),
        className
      )}
    >
      <ButtonCounter
        onClick={handleDecrement}
        isDisabled={disabled || count <= min}
        variant={variant}
        size={size}
      />
      <InputNumber
        className={cn(
          "text-center outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:z-10 px-1",
          variant === "pill"
            ? // height = LÒNG khung (khung trừ border 2px) — bằng khung là input
              // tràn ra đè viền trên/dưới của pill (InputNumber bọc input trong
              // div nên self-stretch không với tới); py-0 đè py-3 của cva gốc
              cn(
                "border-0 bg-transparent text-sm font-semibold focus-visible:ring-inset py-0",
                sizeCls(
                  "h-[30px] w-7",
                  "h-[38px] w-8",
                  "h-[30px] w-7 md:h-[38px] md:w-8"
                )
              )
            : cn(
                "border border-white-600 border-r-0 border-l-0",
                sizeCls("h-8 w-10", "h-10 w-12", "h-8 w-10 md:h-10 md:w-12")
              )
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
        size={size}
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
  size?: "sm" | "md" | "sm-md";
}

const ButtonCounter = ({
  onClick,
  isIncreaseButton,
  isDisabled,
  variant = "split",
  size = "md",
}: ButtonCounterProps) => {
  const sizeCls = (sm: string, md: string, smMd: string) =>
    size === "sm" ? sm : size === "sm-md" ? smMd : md;

  return (
    <button
      type="button"
      aria-label={isIncreaseButton ? "Tăng số lượng" : "Giảm số lượng"}
      className={cn(
        "flex items-center justify-center text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:z-10",
        variant === "pill"
          ? // ghost trong khung chung — ring inset + hover bg bo theo đầu khung;
            // self-stretch thay height cứng để không đè viền pill (khung có border,
            // lòng thấp hơn 2px); hit-area giả mở dọc bù cho nút < 40px
            cn(
              "text-dark-500 focus-visible:ring-inset self-stretch relative after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-['']",
              isIncreaseButton ? "rounded-r-lg" : "rounded-l-lg",
              sizeCls("w-7", "w-9", "w-7 md:w-9")
            )
          : cn(
              "border bg-white border-white-600",
              sizeCls("h-8 w-8", "h-10 w-10", "h-8 w-8 md:h-10 md:w-10"),
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
      {isIncreaseButton ? (
        <Plus
          className={sizeCls(
            "w-3 h-3",
            "w-3.5 h-3.5",
            "w-3 h-3 md:w-3.5 md:h-3.5"
          )}
        />
      ) : (
        <Minus
          className={sizeCls(
            "w-3 h-3",
            "w-3.5 h-3.5",
            "w-3 h-3 md:w-3.5 md:h-3.5"
          )}
        />
      )}
    </button>
  );
};
