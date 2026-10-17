import type { CSSProperties } from "react";
import { BRAND } from "@/config/brand";
import { cn } from "@/config/utils";

// Logo chữ court dùng chung Header + Footer: tên brand 800 + chấm vàng bóng
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
        "font-display font-extrabold tracking-[-0.03em] [line-height:1] whitespace-nowrap",
        className
      )}
      style={style}
    >
      {BRAND.name}
      <span
        aria-hidden="true"
        className="inline-block size-[0.28em] ml-[0.1em] rounded-full bg-[rgb(var(--theme-accent))]"
      />
    </span>
  );
}
