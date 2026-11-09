import type { ThemeHomeProps } from "@/themes/types";
import ContentSlider from "@/components/ui/ContentSlider";
import CardItemGrid from "@/components/ui/CardItemGrid";
import CardItemSlider from "@/components/ui/CardItemSlider";
import CustomerReview from "@/components/ui/CustomerReview";
import UspStrip from "@/app/(main)/_component/UspStrip";
import { PATH } from "@/constants/paths";
import Hero from "./Hero";
import BrandStory from "./BrandStory";
import CategoryTiles from "./home/CategoryTiles";
import ComboSplit from "./home/ComboSplit";
import Lookbook from "./home/Lookbook";

// Thứ tự section theo mockup son-lua (spec §3) — data fetch sẵn ở page.tsx
const Home = ({
  banners,
  saleProducts,
  bestSellers,
  reviews,
  storeSettings,
  combos,
}: ThemeHomeProps) => (
  <>
    <Hero banners={banners} />

    <div className="container-base">
      <UspStrip items={storeSettings.homePromises} />
    </div>

    <CategoryTiles />

    {saleProducts.length > 0 && (
      <div className="container-base">
        <ContentSlider
          title="Office style — your signature"
          subtitle="Đang khuyến mãi: những thiết kế công sở được yêu thích nhất, giá tốt trong tuần này."
          href={PATH.COLLECTION}
        >
          <CardItemGrid dataProduct={saleProducts} />
        </ContentSlider>
      </div>
    )}

    <ComboSplit combos={combos} />

    <Lookbook />

    {bestSellers.length > 0 && (
      <div className="container-base">
        <ContentSlider
          title="Bán chạy nhất"
          href={`${PATH.COLLECTION}?sort=bestseller`}
        >
          <CardItemSlider dataProduct={bestSellers} />
        </ContentSlider>
      </div>
    )}

    {storeSettings.brandStory && (
      <BrandStory story={storeSettings.brandStory} />
    )}

    {reviews.length > 0 && (
      <div className="container-base">
        <ContentSlider
          title="Nàng nói gì"
          subtitle="Phản hồi từ những đơn hàng đã xác nhận mua."
        >
          <CustomerReview reviews={reviews} />
        </ContentSlider>
      </div>
    )}
  </>
);

export default Home;
