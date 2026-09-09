import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/config/utils";
import { Spin } from "@/components/icons";

const buttonVariants = cva(
  "inline-flex px-4 items-center justify-center font-medium gap-2 transition disabled:pointer-events-none disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-700",
        // legacy (các màn chưa redesign): hover đổ đặc nền primary — màn mới dùng `outline`
        outlined:
          "bg-white border border-solid border-primary text-primary-700 hover:bg-primary hover:text-white",
        // hành động phụ đứng cạnh nút đặc (vd nút Google ở login)
        secondary:
          "bg-white border border-white-600 text-dark-500 hover:bg-white-50 disabled:bg-white-100 disabled:text-dark-400",
        // hành động phụ cần điểm neo trên panel trắng (vd resend); hover phủ nhẹ, không đổ đặc
        outline:
          "bg-white border border-primary text-primary-700 hover:bg-primary-50 disabled:border-white-600 disabled:bg-white-100 disabled:text-dark-400",
        // hành động phá hủy trong confirm (xóa địa chỉ) — màu chỉ nằm ở nút, không tô dialog
        danger: "bg-red-800 text-white hover:bg-red-900",
      },
      size: {
        // sm: hành động phụ nhẹ trong khối nội dung (vd Xem thêm mô tả)
        sm: "h-10 rounded-md text-sm",
        md: "h-12 rounded-md",
        lg: "h-14 rounded-xl text-base",
      },
    },
    // Weight là thuộc tính dẫn xuất theo (variant, size) — không expose thành prop riêng
    compoundVariants: [
      { size: "lg", variant: "primary", className: "font-semibold" },
      { size: "lg", variant: "outline", className: "font-semibold" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(buttonVariants({ variant, size, className }))}
      aria-label={props["aria-label"]}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spin className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export default Button;
