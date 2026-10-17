import ContentSlider from "@/components/ui/ContentSlider";
import CardItem from "@/components/ui/CardItem";
import CardItemGrid from "@/components/ui/CardItemGrid";
import RatingStar from "@/components/ui/RatingStar";
import Reveal from "@/components/ui/Reveal";
import UspStrip from "@/app/(main)/_component/UspStrip";
import PromoSplitBanner from "@/app/(main)/_component/PromoSplitBanner";
import { PATH } from "@/constants/paths";
import type { IFeaturedReview } from "@/@types/Home.type";
import type { ThemeHomeProps } from "@/themes/types";
import Hero from "./Hero";
import BrandStory from "./BrandStory";

// Seasonal edit: lưới 4 cột × 2 hàng (mobile 2 cột) — phần còn lại qua "Xem tất cả"
const EDIT_SIZE = 8;
const QUOTE_COUNT = 3;

// Trích dẫn Fraunces cỡ lớn — chỉ review có chữ (content, không thì title)
function ReviewQuotes({ reviews }: { reviews: IFeaturedReview[] }) {
  const quotes = reviews
    .filter((review) => review.content || review.title)
    .slice(0, QUOTE_COUNT);
  if (quotes.length === 0) return null;

  return (
    <section aria-labelledby="quotes-h" className="my-16 md:my-24">
      <Reveal>
        <h2
          id="quotes-h"
          className="type-display-section font-display text-deep"
        >
          Lời từ sân chơi
        </h2>
      </Reveal>
      <ul className="mt-10 grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-3">
        {quotes.map((review) => (
          <li key={review._id} className="border-t border-ink/[.12] pt-6">
            <figure className="flex flex-col h-full">
              <span
                aria-hidden="true"
                className="font-display italic text-6xl leading-none text-terracotta"
              >
                &ldquo;
              </span>
              <blockquote className="mt-1 flex-1 font-display text-[clamp(20px,1.8vw,26px)] leading-snug text-ink line-clamp-6 break-words">
                {review.content || review.title}
              </blockquote>
              <figcaption className="mt-6 text-sm text-dark-500">
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-ink">
                    {review.displayName}
                  </span>
                  <RatingStar rating={review.rating} classStar="w-3 h-3" />
                </span>
                {review.productName && (
                  <span className="block mt-1 truncate">
                    Đã mua: {review.productName}
                  </span>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
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

      {bestSellers.length > 0 && (
        <div className="container-base">
          <Reveal>
            <ContentSlider
              title="Tuyển chọn cho mùa mới"
              subtitle="Những món được chọn nhiều nhất mùa này"
              href={`${PATH.COLLECTION}?sort=bestseller`}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
                {bestSellers.slice(0, EDIT_SIZE).map((item) => (
                  <CardItem key={item._id} productItem={item} />
                ))}
              </div>
            </ContentSlider>
          </Reveal>
        </div>
      )}

      {storeSettings.brandStory && (
        <BrandStory story={storeSettings.brandStory} />
      )}

      <div className="container-base">
        {storeSettings.promoTiles.length > 0 && (
          <div className="mt-16 md:mt-24">
            <PromoSplitBanner tiles={storeSettings.promoTiles} />
          </div>
        )}

        {saleProducts.length > 0 && (
          <Reveal>
            <ContentSlider title="Đang khuyến mãi" href={PATH.COLLECTION}>
              <CardItemGrid dataProduct={saleProducts} />
            </ContentSlider>
          </Reveal>
        )}

        <ReviewQuotes reviews={reviews} />

        {storeSettings.homePromises.length > 0 && (
          <div className="mt-16 md:mt-24">
            <UspStrip items={storeSettings.homePromises} />
          </div>
        )}
      </div>
    </>
  );
}
