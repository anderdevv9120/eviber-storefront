import { Metadata } from "next";
import ContentSlider from "@/components/ui/ContentSlider";
import CardItemGrid from "@/components/ui/CardItemGrid";
import CardItemSlider from "@/components/ui/CardItemSlider";
import Category from "@/components/ui/Category";
import CustomerReview from "@/components/ui/CustomerReview";
import HeroBanner from "./_component/HeroBanner";
import UspStrip from "./_component/UspStrip";
import PromoSplitBanner from "./_component/PromoSplitBanner";
import { PATH } from "@/constants/paths";
import { getBanners, getFeaturedReviews } from "@/apis/home";
import { getProducts } from "@/apis/product";
import { IBanner, IFeaturedReview } from "@/@types/Home.type";
import { IProductListItem } from "@/@types/Product.type";

// ISR: home render tĩnh, tự làm mới nền mỗi 5 phút (đã chốt GĐ2) —
// khách không chờ BE mỗi request, data trễ tối đa 5 phút.
export const revalidate = 300;

// Grid KM desktop 2 hàng × 5; slider Bán chạy 5 cột × 2 trang
const RAIL_PAGE_SIZE = 10;

/**
 * Mỗi section fetch độc lập, lỗi/rỗng → trả [] để section tự ẩn —
 * một nguồn chết không được kéo sập cả trang (đã chốt todo).
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
      pageSize: RAIL_PAGE_SIZE,
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
  const [banners, saleProducts, bestSellers, reviews] = await Promise.all([
    fetchBanners(),
    fetchSaleProducts(),
    fetchBestSellers(),
    fetchFeaturedReviews(),
  ]);

  return (
    <main>
      {/* H1 cố định cho SEO (sr-only) — hero là carousel data CMS nên title slide giữ h2 */}
      <h1 className="sr-only">
        CLOTHES — Thời trang tối giản, mặc bền nhiều mùa
      </h1>
      <HeroBanner banners={banners} />

      <div className="container-base">
        <Category />

        {saleProducts.length > 0 && (
          <ContentSlider title="Đang khuyến mãi" href={PATH.COLLECTION}>
            <CardItemGrid dataProduct={saleProducts} />
          </ContentSlider>
        )}

        <PromoSplitBanner />

        {bestSellers.length > 0 && (
          <ContentSlider title="Bán chạy" href={PATH.COLLECTION}>
            <CardItemSlider dataProduct={bestSellers} />
          </ContentSlider>
        )}
      </div>

      {/* Band màu CHỈ bọc Review (đã chốt) — py-px chặn margin-collapse
          để margin của ContentSlider tự làm đệm trong band */}
      {reviews.length > 0 && (
        <section className="bg-primary-50 mt-16 md:mt-24 py-px">
          <div className="container-base">
            <ContentSlider
              title="Phản hồi từ khách hàng"
              subtitle="Từ những đơn hàng đã xác nhận mua"
            >
              <CustomerReview reviews={reviews} />
            </ContentSlider>
          </div>
        </section>
      )}

      <div className="container-base mt-16 md:mt-24">
        <UspStrip />
      </div>
    </main>
  );
}

const HOME_DESCRIPTION =
  "Khám phá bộ sưu tập mới và ưu đãi dành riêng cho thành viên tại CLOTHES — thời trang tối giản, phom chuẩn, giá minh bạch.";

export const metadata: Metadata = {
  // absolute: homepage cần brand + USP thay vì "Trang chủ | CLOTHES" (template dành cho trang con)
  title: { absolute: "CLOTHES — Thời trang tối giản, mặc bền nhiều mùa" },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "CLOTHES",
    title: "CLOTHES — Thời trang tối giản, mặc bền nhiều mùa",
    description: HOME_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CLOTHES" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLOTHES — Thời trang tối giản, mặc bền nhiều mùa",
    description: HOME_DESCRIPTION,
    images: ["/og.png"],
  },
};
