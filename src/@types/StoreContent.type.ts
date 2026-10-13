/**
 * Contract nội dung cửa hàng — đối chiếu BE modules/store-content:
 * - IStoreSettings → GET /store-settings
 * - IPolicyPage    → GET /policies/:slug (chỉ trang đã xuất bản)
 */
export type PolicySlug = "dieu-khoan" | "doi-tra" | "ho-tro" | "bao-mat";
export type PromoTileTheme = "light" | "dark";

export interface IPromoTile {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  image: string;
  theme: PromoTileTheme;
}

export interface IHomePromise {
  title: string;
  description: string;
}

// CTA chỉ có khi đủ cặp ctaLabel + href (BE validate)
export interface IBrandStory {
  title: string;
  body: string;
  image: string;
  ctaLabel?: string;
  href?: string;
}

export interface IStoreSettings {
  contact: { address: string; email: string; phone: string };
  socials: { facebook: string; instagram: string; twitter: string };
  promoTiles: IPromoTile[];
  homePromises: IHomePromise[];
  productPromises: string[];
  publishedPolicySlugs: PolicySlug[];
  // null = ẩn section trên home
  brandStory: IBrandStory | null;
}

export interface IPolicyPage {
  slug: PolicySlug;
  title: string;
  contentHtml: string;
  updatedAt: string | null;
}
