import type { CSSProperties, ComponentType } from "react";
import { IBanner, ICategoryItem, IFeaturedReview } from "@/@types/Home.type";
import type { IProductListItem } from "@/@types/Product.type";
import type { IBrandStory, IStoreSettings } from "@/@types/StoreContent.type";

export interface ThemeHeaderProps {
  categories: ICategoryItem[];
}

export interface ThemeHeroProps {
  banners: IBanner[];
}

export interface ThemeBrandStoryProps {
  story: IBrandStory;
}

export interface ThemeHomeProps {
  banners: IBanner[];
  saleProducts: IProductListItem[];
  bestSellers: IProductListItem[];
  reviews: IFeaturedReview[];
  storeSettings: IStoreSettings;
}

export interface ThemeProductCardProps {
  productItem: IProductListItem;
  currentPriceClass?: string;
  priceClass?: string;
}

export interface ThemeFooterProps {
  settings: IStoreSettings;
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
  /** Phần thân trang chủ (sau h1 sr-only trong <main> của page.tsx) — trả fragment các section */
  Home: ComponentType<ThemeHomeProps>;
  /** Thẻ sản phẩm — CardItem/CardItemGrid/CardItemSlider render qua slot này */
  ProductCard: ComponentType<ThemeProductCardProps>;
  /** Footer toàn site (layout main) */
  Footer: ComponentType<ThemeFooterProps>;
}
