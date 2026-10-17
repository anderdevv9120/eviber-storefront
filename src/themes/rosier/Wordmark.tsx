import type { CSSProperties } from "react";
import { BRAND } from "@/config/brand";
import { cn } from "@/config/utils";

// Logo chữ rosier dùng chung Header + Footer — đổi nhận diện chỉ sửa tại đây
export default function Wordmark({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        // [line-height:1] thay leading-none: caller truyền text-[Npx], twMerge coi text-size xung đột leading-* và xóa mất
        "font-display italic [line-height:1] whitespace-nowrap",
        className
      )}
      style={style}
    >
      {BRAND.name}
    </span>
  );
}
