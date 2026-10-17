"use client";

import { memo } from "react";
import ProductCard from "@active-theme/card";
import type { ThemeProductCardProps } from "@/themes/types";

// Pass-through: markup thẻ sản phẩm do theme quyết định (ProductCard)
function CardItem(props: ThemeProductCardProps) {
  return <ProductCard {...props} />;
}

export default memo(CardItem);
