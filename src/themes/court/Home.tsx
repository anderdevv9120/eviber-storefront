import Link from "next/link";
import { fetchCategoriesCached } from "@/apis/home.server";
import ContentSlider from "@/components/ui/ContentSlider";
import CardItemGrid from "@/components/ui/CardItemGrid";
import CardItemSlider from "@/components/ui/CardItemSlider";
import CustomerReview from "@/components/ui/CustomerReview";
import Reveal from "@/components/ui/Reveal";
import UspStrip from "@/app/(main)/_component/UspStrip";
import PromoSplitBanner from "@/app/(main)/_component/PromoSplitBanner";
import { PATH } from "@/constants/paths";
import type { ThemeHomeProps } from "@/themes/types";
import Hero from "./Hero";
import BrandStory from "./BrandStory";

const CHIP =
  "inline-flex items-center min-h-11 px-5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2";

// Chip lọc theo danh mục ngay dưới hero (mockup Court) — rỗng/lỗi → ẩn
async function CategoryChips() {
  const categories = await fetchCategoriesCached();
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Mua theo danh mục" className="mt-6 md:mt-8">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href={PATH.COLLECTION}
            className={`${CHIP} bg-ink border-ink text-white hover:bg-primary-600`}
          >
            Tất cả
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category._id}>
            <Link
              href={
                category.slug
                  ? `${PATH.COLLECTION}?category=${encodeURIComponent(category.slug)}`
                  : PATH.COLLECTION
              }
              className={`${CHIP} border-white-300 text-dark-600 hover:border-ink hover:text-ink`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Home({
  banners,
  saleProducts,
  bestSellers,
  reviews,
  storeSettings,
}: ThemeHomeProps) {
  return (
    <>
      <Hero banners={banners} />

      <div className="container-base">
        <CategoryChips />

        {saleProducts.length > 0 && (
          <Reveal>
            <ContentSlider title="Đang khuyến mãi" href={PATH.COLLECTION}>
              <CardItemGrid dataProduct={saleProducts} />
            </ContentSlider>
          </Reveal>
        )}

        {storeSettings.promoTiles.length > 0 && (
          <PromoSplitBanner tiles={storeSettings.promoTiles} />
        )}

        {bestSellers.length > 0 && (
          <Reveal>
            <ContentSlider
              title="Bán chạy"
              href={`${PATH.COLLECTION}?sort=bestseller`}
            >
              <CardItemSlider dataProduct={bestSellers} />
            </ContentSlider>
          </Reveal>
        )}
      </div>

      {storeSettings.brandStory && (
        <BrandStory story={storeSettings.brandStory} />
      )}

      {reviews.length > 0 && (
        <div className="container-base">
          <Reveal>
            <ContentSlider
              title="Phản hồi từ khách hàng"
              subtitle="Từ những đơn hàng đã xác nhận mua"
            >
              <CustomerReview reviews={reviews} />
            </ContentSlider>
          </Reveal>
        </div>
      )}

      {storeSettings.homePromises.length > 0 && (
        <div className="container-base mt-16 md:mt-24">
          <UspStrip items={storeSettings.homePromises} />
        </div>
      )}
    </>
  );
}
