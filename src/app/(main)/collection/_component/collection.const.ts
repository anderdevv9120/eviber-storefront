// Hằng dùng chung các component màn collection (GĐ2 map sang params GET /products)

export const PAGE_SIZE = 12;

// Cap slider giá: seed thật trải 149k–890k → 1tr tròn số phủ hết + có khoảng thở
export const PRICE_CAP = 1_000_000;
export const PRICE_STEP = 50_000;

export type SortKey = "newest" | "bestseller" | "priceAsc" | "priceDesc";

// GĐ2: newest = mặc định BE (createdAt desc, URL sạch không mang param).
// label = dropdown mobile (đầy đủ); inlineLabel = hàng inline options desktop (ngắn)
export const SORT_OPTIONS: {
  value: SortKey;
  label: string;
  inlineLabel: string;
}[] = [
  { value: "newest", label: "Mới nhất", inlineLabel: "Mới nhất" },
  { value: "bestseller", label: "Bán chạy", inlineLabel: "Bán chạy" },
  { value: "priceAsc", label: "Giá tăng dần", inlineLabel: "Giá ↑" },
  { value: "priceDesc", label: "Giá giảm dần", inlineLabel: "Giá ↓" },
];

/** Item danh mục cho sidebar — rút từ ICategoryItem (bỏ item thiếu slug, không filter được) */
export interface ICollectionCategoryOption {
  slug: string;
  name: string;
}

// Gap dọc lớn hơn gap ngang — text block dưới card có khoảng thở
export const COLLECTION_GRID_CLASS =
  "grid gap-x-3.5 gap-y-3.5 md:gap-y-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 h-fit";

// Header section sidebar — uppercase editorial (chốt mockup vòng 6, hướng H1);
// màu tường minh, không để inherit ngoài palette
export const SIDEBAR_HEADER_CLASS =
  "text-xs font-extrabold uppercase tracking-widest text-dark-800";
