import { Metadata } from "next";
import { BRAND } from "@/config/brand";
import theme from "@active-theme";
import { getBanners, getFeaturedReviews } from "@/apis/home";
import { fetchStoreSettingsCached } from "@/apis/home.server";
import { getProducts } from "@/apis/product";
import { IBanner, IFeaturedReview } from "@/@types/Home.type";
import { IProductListItem } from "@/@types/Product.type";

// ISR: home render tĩnh, tự làm mới nền mỗi 5 phút —
// khách không chờ BE mỗi request, data trễ tối đa 5 phút.
export const revalidate = 300;

// KM chỉ 1 hàng (5 card desktop) để 2 rail không thành một khối lưới liền; Bán chạy 5 cột × 2 trang
const SALE_GRID_SIZE = 5;
const RAIL_PAGE_SIZE = 10;

/**
 * Mỗi section fetch độc lập, lỗi/rỗng → trả [] để section tự ẩn —
 * một nguồn chết không được kéo sập cả trang.
 * LƯU Ý shape: interceptor axios đã unwrap 1 lớp (trả body BE) →
 * `response.data` = field data của TransformInterceptor.
 */
async function fetchBanners(): Promise<IBanner[]> {
  try {
    const response = await getBanners();
    return response?.data || [];
  } catch {
    return [];
  }
}

async function fetchSaleProducts(): Promise<IProductListItem[]> {
  try {
    const response = await getProducts({
      onSale: true,
      pageSize: SALE_GRID_SIZE,
    });
    return response?.data?.data || [];
  } catch {
    return [];
  }
}

async function fetchBestSellers(): Promise<IProductListItem[]> {
  try {
    const response = await getProducts({
      sortBy: "soldCount",
      sortOrder: "desc",
      pageSize: RAIL_PAGE_SIZE,
    });
    return response?.data?.data || [];
  } catch {
    return [];
  }
}

async function fetchFeaturedReviews(): Promise<IFeaturedReview[]> {
  try {
    const response = await getFeaturedReviews();
    return response?.data?.reviews || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [banners, saleProducts, bestSellers, reviews, storeSettings] =
    await Promise.all([
      fetchBanners(),
      fetchSaleProducts(),
      fetchBestSellers(),
      fetchFeaturedReviews(),
      fetchStoreSettingsCached(),
    ]);

  return (
    <main>
      {/* H1 cố định cho SEO (sr-only) — hero là carousel data CMS nên title slide giữ h2 */}
      <h1 className="sr-only">
        {BRAND.name} — {BRAND.tagline}
      </h1>
      <theme.Home
        banners={banners}
        saleProducts={saleProducts}
        bestSellers={bestSellers}
        reviews={reviews}
        storeSettings={storeSettings}
      />
    </main>
  );
}

const HOME_DESCRIPTION = BRAND.description;

export const metadata: Metadata = {
  // absolute: homepage cần brand + USP thay vì "Trang chủ | tên brand" (template dành cho trang con)
  title: { absolute: `${BRAND.name} — ${BRAND.tagline}` },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: HOME_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: HOME_DESCRIPTION,
    images: ["/og.png"],
  },
};
