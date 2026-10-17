import theme from "@active-theme";
import ContentSlider from "@/components/ui/ContentSlider";
import CardItemGrid from "@/components/ui/CardItemGrid";
import CardItemSlider from "@/components/ui/CardItemSlider";
import Category from "@/components/ui/Category";
import CustomerReview from "@/components/ui/CustomerReview";
import UspStrip from "./UspStrip";
import PromoSplitBanner from "./PromoSplitBanner";
import { PATH } from "@/constants/paths";
import type { ThemeHomeProps } from "@/themes/types";

// Function declaration (hoisted): theme/index.ts import file này còn file này import @active-theme (vòng);
// chỉ chạm theme.* trong render, không ở top-level.
export default function DefaultHome({
  banners,
  saleProducts,
  bestSellers,
  reviews,
  storeSettings,
}: ThemeHomeProps) {
  return (
    <>
      <theme.Hero banners={banners} />

      <div className="container-base">
        <Category />

        {saleProducts.length > 0 && (
          <ContentSlider title="Đang khuyến mãi" href={PATH.COLLECTION}>
            <CardItemGrid dataProduct={saleProducts} />
          </ContentSlider>
        )}

        <PromoSplitBanner tiles={storeSettings.promoTiles} />

        {bestSellers.length > 0 && (
          <ContentSlider
            title="Bán chạy"
            href={`${PATH.COLLECTION}?sort=bestseller`}
          >
            <CardItemSlider dataProduct={bestSellers} />
          </ContentSlider>
        )}
      </div>

      {storeSettings.brandStory && (
        <theme.BrandStory story={storeSettings.brandStory} />
      )}

      {reviews.length > 0 && (
        <div className="container-base">
          <ContentSlider
            title="Phản hồi từ khách hàng"
            subtitle="Từ những đơn hàng đã xác nhận mua"
          >
            <CustomerReview reviews={reviews} />
          </ContentSlider>
        </div>
      )}

      <div className="container-base mt-16 md:mt-24">
        <UspStrip items={storeSettings.homePromises} />
      </div>
    </>
  );
}
