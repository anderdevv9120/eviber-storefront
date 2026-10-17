import type { CSSProperties } from "react";
import { BRAND } from "@/config/brand";
import { cn } from "@/config/utils";

// Logo chữ clubhouse dùng chung Header + Footer: Fraunces nghiêng
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
        // [line-height:1] thay leading-none: caller truyền text-[Npx], twMerge coi text-size xung đột leading-*
        "font-display italic tracking-[-0.01em] [line-height:1] whitespace-nowrap",
        className
      )}
      style={style}
    >
      {BRAND.name}
    </span>
  );
}
