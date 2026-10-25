import { MetadataRoute } from "next";
import { fetchStoreSettingsCached } from "@/apis/home.server";
import { getProducts } from "@/apis/product";
import { getCombos } from "@/apis/combo";
import { PATH } from "@/constants/paths";

// Sinh lúc request (không phải postbuild) để URL product luôn theo catalog hiện tại;
// mặc định Next build tĩnh route này nên phải khai revalidate
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3030";

// BE cap pageSize 100; trang lỗi giữa chừng → dừng, giữ phần đã lấy thay vì sitemap rỗng
const PRODUCT_PAGE_SIZE = 100;
const MAX_PRODUCT_PAGES = 50;

// Trang noindex (cart/checkout/auth utility) và vùng /user chủ đích không nằm đây
const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: PATH.HOME, priority: 1 },
  { path: PATH.COLLECTION, priority: 0.9 },
  { path: PATH.LOGIN, priority: 0.3 },
  { path: PATH.REGISTER, priority: 0.3 },
];

async function fetchAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
    try {
      const response = await getProducts({
        page,
        pageSize: PRODUCT_PAGE_SIZE,
      });
      const list = response?.data;
      const items: { slug?: string }[] = list?.data ?? [];
      items.forEach((item) => item.slug && slugs.push(item.slug));
      if (page >= (list?.totalPage ?? 1)) break;
    } catch {
      break;
    }
  }
  return slugs;
}

async function fetchAllComboSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
    try {
      const response = await getCombos({ page, pageSize: PRODUCT_PAGE_SIZE });
      const list = response?.data;
      const items: { slug?: string }[] = list?.data ?? [];
      items.forEach((item) => item.slug && slugs.push(item.slug));
      if (page >= (list?.totalPage ?? 1)) break;
    } catch {
      break;
    }
  }
  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, storeSettings, comboSlugs] = await Promise.all([
    fetchAllProductSlugs(),
    fetchStoreSettingsCached(),
    fetchAllComboSlugs(),
  ]);
  const now = new Date();

  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority,
    })),
    ...slugs.map((slug) => ({
      url: `${SITE_URL}${PATH.PRODUCT}/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...comboSlugs.map((slug) => ({
      url: `${SITE_URL}${PATH.COMBO}/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Chỉ trang đã xuất bản; BE lỗi → fallback rỗng, không thêm URL nào
    ...storeSettings.publishedPolicySlugs.map((slug) => ({
      url: `${SITE_URL}${PATH.POLICY}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
