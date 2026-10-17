"use client";

import { memo } from "react";
import theme from "@active-theme";
import type { ThemeProductCardProps } from "@/themes/types";

// Pass-through: markup thẻ sản phẩm do theme quyết định (theme.ProductCard)
function CardItem(props: ThemeProductCardProps) {
  return <theme.ProductCard {...props} />;
}

export default memo(CardItem);
