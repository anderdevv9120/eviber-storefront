import { PATH } from "./paths";

export const SEARCH_PARAM = "search";
// Dưới 2 ký tự regex BE khớp gần như toàn catalog — gợi ý vô nghĩa
export const SEARCH_MIN_CHARS = 2;
// 300ms: dưới ngưỡng này gõ nhanh vẫn bắn request cho từng ký tự
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_SUGGEST_LIMIT = 4;
export const SEARCH_MAX_LENGTH = 100;

export const normalizeSearchTerm = (raw: string): string =>
  raw.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH);

/** URL kết quả tìm kiếm SẠCH (không mang filter/sort cũ) — search mới là phiên duyệt mới */
export const buildSearchHref = (term: string): string => {
  const params = new URLSearchParams({ [SEARCH_PARAM]: term });
  return `${PATH.COLLECTION}?${params.toString()}`;
};
