import { IGetProductsParams } from "@/apis/product";
import { IProductListItem } from "@/@types/Product.type";
import {
  PAGE_SIZE,
  PRICE_CAP,
  PRICE_STEP,
  SORT_OPTIONS,
  SortKey,
} from "./collection.const";

/** Query state của màn collection — parse từ URL searchParams, nguồn sự thật duy nhất */
export interface ICollectionQuery {
  categories: string[];
  priceMin: number;
  priceMax: number;
  sort: SortKey;
  page: number;
}

/** Kết quả 1 lần fetch danh sách — rút gọn từ IResponseList của BE */
export interface ICollectionResult {
  items: IProductListItem[];
  total: number;
  totalPage: number;
}

export const EMPTY_COLLECTION_RESULT: ICollectionResult = {
  items: [],
  total: 0,
  totalPage: 1,
};

type SearchParamsSource =
  URLSearchParams | Record<string, string | string[] | undefined>;

const getParam = (
  source: SearchParamsSource,
  key: string
): string | undefined => {
  if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
  const value = source[key];
  return Array.isArray(value) ? value[0] : value;
};

// Snap về bội của PRICE_STEP trong [0, PRICE_CAP] — giá trị rác/lẻ trên URL
// không làm slider lệch nấc (input range chỉ nhận bội của step)
const sanitizePrice = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  const snapped = Math.round(parsed / PRICE_STEP) * PRICE_STEP;
  return Math.min(PRICE_CAP, Math.max(0, snapped));
};

const isSortKey = (value: string | undefined): value is SortKey =>
  SORT_OPTIONS.some((option) => option.value === value);

/**
 * Parse + sanitize searchParams → query state. Chỉ đọc key trong whitelist
 * (category/priceMin/priceMax/sort/page) — BE bật forbidNonWhitelisted nên
 * KHÔNG forward nguyên searchParams; giá trị rác đưa về default im lặng.
 */
export function parseCollectionQuery(
  source: SearchParamsSource
): ICollectionQuery {
  const categories = (getParam(source, "category") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  let priceMin = sanitizePrice(getParam(source, "priceMin"), 0);
  let priceMax = sanitizePrice(getParam(source, "priceMax"), PRICE_CAP);
  // priceMax=0 sửa tay là vô nghĩa (chip "Dưới 0k", kết quả luôn rỗng) → coi như không chặn trên
  if (priceMax === 0) priceMax = PRICE_CAP;
  if (priceMin > priceMax) {
    // Cặp giá mâu thuẫn (URL sửa tay) → bỏ cả filter giá thay vì đoán ý
    priceMin = 0;
    priceMax = PRICE_CAP;
  }

  const sortRaw = getParam(source, "sort");
  const pageParsed = Number(getParam(source, "page"));

  return {
    categories: Array.from(new Set(categories)),
    priceMin,
    priceMax,
    sort: isSortKey(sortRaw) ? sortRaw : "newest",
    page: Number.isInteger(pageParsed) && pageParsed >= 1 ? pageParsed : 1,
  };
}

/**
 * Build query-string "?..." (hoặc "" khi toàn default). Mọi giá trị default
 * không lên URL — URL sạch thân thiện canonical/share; cũng là khóa so sánh
 * chuẩn hóa giữa 2 trạng thái query (dùng làm dep của effect fetch).
 */
export function buildCollectionSearch(query: ICollectionQuery): string {
  const params = new URLSearchParams();
  if (query.categories.length) {
    params.set("category", query.categories.join(","));
  }
  if (query.priceMin > 0) params.set("priceMin", String(query.priceMin));
  if (query.priceMax < PRICE_CAP)
    params.set("priceMax", String(query.priceMax));
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `?${search}` : "";
}

// Khóa sort gọn phía URL → cặp sortBy/sortOrder của contract BE;
// newest = default BE (createdAt desc), không gửi param
const SORT_TO_API: Record<
  Exclude<SortKey, "newest">,
  Pick<IGetProductsParams, "sortBy" | "sortOrder">
> = {
  bestseller: { sortBy: "soldCount", sortOrder: "desc" },
  priceAsc: { sortBy: "price", sortOrder: "asc" },
  priceDesc: { sortBy: "price", sortOrder: "desc" },
};

/** Map query state → params GET /products — chỉ gửi khác default (priceMax = CAP nghĩa là không chặn trên) */
export function toProductApiParams(
  query: ICollectionQuery
): IGetProductsParams {
  const params: IGetProductsParams = {
    page: query.page,
    pageSize: PAGE_SIZE,
  };
  if (query.categories.length) params.category = query.categories.join(",");
  if (query.priceMin > 0) params.priceMin = query.priceMin;
  if (query.priceMax < PRICE_CAP) params.priceMax = query.priceMax;
  if (query.sort !== "newest") {
    const { sortBy, sortOrder } = SORT_TO_API[query.sort];
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
  }
  return params;
}
