import type { ThemeHomeProps } from "@/themes/types";
import ContentSlider from "@/components/ui/ContentSlider";
import CardItemSlider from "@/components/ui/CardItemSlider";
import UspStrip from "@/app/(main)/_component/UspStrip";
import { PATH } from "@/constants/paths";
import Hero from "./Hero";
import BrandStory from "./BrandStory";
import CategoryTiles from "./home/CategoryTiles";
import ComboSplit from "./home/ComboSplit";
import Lookbook from "./home/Lookbook";
import Reviews from "./home/Reviews";
import SaleGrid from "./home/SaleGrid";

// Thứ tự section theo mockup son-lua (spec §3) — data fetch sẵn ở page.tsx;
// `reviews` (review DB) bỏ qua: "Nàng nói gì" là review cứng của mockup (home/Reviews)
const Home = ({
  banners,
  saleProducts,
  bestSellers,
  storeSettings,
  combos,
}: ThemeHomeProps) => (
  <>
    <Hero banners={banners} />

    <div className="container-base">
      <UspStrip items={storeSettings.homePromises} />
    </div>

    <CategoryTiles />

    {saleProducts.length > 0 && <SaleGrid fallback={saleProducts} />}

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

    <Reviews />
  </>
);

export default Home;
