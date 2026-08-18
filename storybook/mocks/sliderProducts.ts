import type { IProductDetail } from "@/@types/Product.type";
import { svgPlaceholder } from "./images";

/**
 * Danh sách IProductDetail cho CardItemSlider (mock tự chứa, ảnh data-URI
 * local, KHÔNG import fetchData.ts, KHÔNG URL ngoài).
 */
const COLORS = [
  "#009060",
  "#0089ED",
  "#F9A825",
  "#FC2B2B",
  "#15803D",
  "#242424",
  "#6d28d9",
  "#be185d",
];

function makeProduct(i: number): IProductDetail {
  return {
    _id: `slider-prod-${i}`,
    name: `Sản phẩm mẫu ${i}`,
    description: `Mô tả ngắn cho sản phẩm ${i}.`,
    price: 100000 * i,
    inventoryCount: 10 + i,
    images: [svgPlaceholder(`SP ${i}`, COLORS[i % COLORS.length], 400, 400)],
    slug: `san-pham-mau-${i}`,
    attributes: ["Size M"],
    discount: i % 2 === 0 ? 15 : 0,
    rating: (i % 5) + 1,
    isFavorite: false,
    disabled: false,
  };
}

/** 8 sản phẩm — đủ để hiện nút next/prev trên desktop (visible = 5). */
export const sliderProducts: IProductDetail[] = Array.from(
  { length: 8 },
  (_, idx) => makeProduct(idx + 1)
);

/** Ít item hơn số hiển thị (2) — kiểm tra index không âm. */
export const fewSliderProducts: IProductDetail[] = sliderProducts.slice(0, 2);
