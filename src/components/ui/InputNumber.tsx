"use client";

import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, truncateLeadingZeros } from "@/config/utils";
import { NUMBER_REGEX } from "@/constants";

const inputVariants = cva(
  "w-full py-3 text-dark-900 placeholder-dark-300 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
  {
    variants: {
      variant: {
        outlined:
          "border px-3 border-dark-200 hover:border-primary focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100",
        standard:
          "border-b-[1px] border-b-dark-200 py-2 hover:border-b-primary focus-visible:border-b-primary-500",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

interface InputNumberProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  value?: number;
  defaultValue?: number;
  isSpinButton?: boolean;
  onChange?: (value: number) => void;
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      className,
      error,
      variant = "outlined",
      value,
      defaultValue,
      isSpinButton = true,
      onChange,
      ...props
    },
    ref
  ) => {
    const [valueInput, setValueInput] = useState<string | number>(
      defaultValue ?? ""
    );

    // Chỉ đồng bộ khi prop `value` đổi, không phụ thuộc `valueInput`
    // để tránh ghi đè chuỗi người dùng đang gõ (kể cả khi xóa trắng).
    useEffect(() => {
      if (value === undefined) return;
      if (Number(valueInput) !== value) {
        setValueInput(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.currentTarget as HTMLInputElement).blur();
      }
    };

    const formatMessage = () => {
      if (props.min !== undefined && props.max !== undefined)
        return `Giá trị phải nhỏ hơn ${props.max} và lớn hơn ${props.min}`;
      if (props.min !== undefined) return `Giá trị phải lớn hơn ${props.min}`;
      if (props.max !== undefined) return `Giá trị phải nhỏ hơn ${props.max}`;
      return "";
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      e.target.setCustomValidity("");
      const rawValue = e.target.value;

      if (!NUMBER_REGEX.test(rawValue)) return;

      // Để trống: cập nhật hiển thị, không emit giá trị ngoài ý muốn (vd 0)
      if (rawValue === "") {
        setValueInput("");
        return;
      }

      const min = props.min !== undefined ? Number(props.min) : -Infinity;
      const max = props.max !== undefined ? Number(props.max) : Infinity;
      const numericValue = Number(rawValue);
      const clampedValue = Math.min(Math.max(numericValue, min), max);

      // Đặt message TRƯỚC khi report để hiển thị đúng lúc
      if (numericValue < min || numericValue > max) {
        e.target.setCustomValidity(formatMessage());
        e.target.reportValidity();
      }

      onChange?.(clampedValue);

      setValueInput(
        clampedValue === numericValue
          ? truncateLeadingZeros(rawValue)
          : String(clampedValue)
      );
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      // Ô để trống khi rời focus → khôi phục về giá trị hợp lệ gần nhất,
      // tránh kẹt hiển thị rỗng khi controlled parent giữ nguyên `value`.
      if (e.target.value === "") {
        if (value !== undefined) {
          // Controlled: về đúng value hiện tại (không cần emit lại).
          setValueInput(value);
        } else {
          // Uncontrolled: về min nếu có, ngược lại 0; emit để parent đồng bộ.
          const fallback = props.min !== undefined ? Number(props.min) : 0;
          setValueInput(fallback);
          onChange?.(fallback);
        }
      }
      props.onBlur?.(e);
    };

    return (
      <div>
        <div className="w-full">
          <input
            type="number"
            className={cn(inputVariants({ variant, className }), {
              "input-number": !isSpinButton,
            })}
            ref={ref}
            value={valueInput}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            {...props}
            onBlur={handleBlur}
          />
        </div>
      </div>
    );
  }
);

export default InputNumber;
