import type { CSSProperties, ComponentType } from "react";
import { IBanner, ICategoryItem, IFeaturedReview } from "@/@types/Home.type";
import type { IBrandStory, IStoreSettings } from "@/@types/StoreContent.type";
import type { IComboCard } from "@/@types/Combo.type";
import type { IProductListItem } from "@/@types/Product.type";

export interface ThemeHeaderProps {
  categories: ICategoryItem[];
}

export interface ThemeHeroProps {
  banners: IBanner[];
}

export interface ThemeBrandStoryProps {
  story: IBrandStory;
}

/** Data home đã fetch sẵn ở src/app/(main)/page.tsx — theme chỉ lo layout */
export interface ThemeHomeProps {
  banners: IBanner[];
  saleProducts: IProductListItem[];
  bestSellers: IProductListItem[];
  reviews: IFeaturedReview[];
  storeSettings: IStoreSettings;
  combos: IComboCard[];
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
  /** Layout home riêng của theme — thiếu thì page.tsx dùng layout mặc định */
  Home?: ComponentType<ThemeHomeProps>;
}
