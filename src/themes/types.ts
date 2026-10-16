import type { CSSProperties, ComponentType } from "react";
import { IBanner, ICategoryItem } from "@/@types/Home.type";
import type { IBrandStory } from "@/@types/StoreContent.type";

export interface ThemeHeaderProps {
  categories: ICategoryItem[];
}

export interface ThemeHeroProps {
  banners: IBanner[];
}

export interface ThemeBrandStoryProps {
  story: IBrandStory;
}

// Hợp đồng mỗi theme (src/themes/<name>/index.ts) phải thỏa — chọn theme qua env THEME lúc build
export interface ThemeModule {
  /** Class `.variable` của next/font — gắn lên <html> */
  fontClassName: string;
  Header: ComponentType<ThemeHeaderProps>;
  Hero: ComponentType<ThemeHeroProps>;
  /** Section câu chuyện thương hiệu (home) — tự lo container/band của mình */
  BrandStory: ComponentType<ThemeBrandStoryProps>;
  /** Logo chữ ngoài Header (Footer) — để 2 nơi cùng một nhận diện */
  Wordmark: ComponentType<{ className?: string; style?: CSSProperties }>;
}
