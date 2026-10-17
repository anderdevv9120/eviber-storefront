import type { CSSProperties } from "react";
import { BRAND } from "@/config/brand";
import { cn } from "@/config/utils";

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
        "font-display font-bold uppercase tracking-[-0.05em] [line-height:1.1]",
        className
      )}
      style={style}
    >
      {BRAND.name}
    </span>
  );
}
