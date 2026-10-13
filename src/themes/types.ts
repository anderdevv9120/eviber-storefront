import type { ComponentType } from "react";
import { IBanner, ICategoryItem } from "@/@types/Home.type";

export interface ThemeHeaderProps {
  categories: ICategoryItem[];
}

export interface ThemeHeroProps {
  banners: IBanner[];
}

// Hợp đồng mỗi theme (src/themes/<name>/index.ts) phải thỏa — chọn theme qua env THEME lúc build
export interface ThemeModule {
  /** Class `.variable` của next/font — gắn lên <html> */
  fontClassName: string;
  Header: ComponentType<ThemeHeaderProps>;
  Hero: ComponentType<ThemeHeroProps>;
}
