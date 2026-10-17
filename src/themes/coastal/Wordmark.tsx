import type { CSSProperties } from "react";
import { BRAND } from "@/config/brand";
import { cn } from "@/config/utils";

// Logo chữ coastal dùng chung Header + Footer: tên brand 800 + mặt trời nhỏ (vòng hào quang mờ)
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
        "inline-flex items-center gap-[0.3em] font-display font-extrabold tracking-[-0.02em] [line-height:1] whitespace-nowrap",
        className
      )}
      style={style}
    >
      {BRAND.name}
      <span
        aria-hidden="true"
        className="inline-block size-[0.42em] rounded-full bg-[rgb(var(--theme-sun))] shadow-[0_0_0_0.12em_rgb(var(--theme-sun)/0.35)]"
      />
    </span>
  );
}
