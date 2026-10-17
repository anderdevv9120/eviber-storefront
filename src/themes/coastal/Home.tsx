import Image from "next/image";
import Link from "next/link";
import { fetchCategoriesCached } from "@/apis/home.server";
import ContentSlider from "@/components/ui/ContentSlider";
import CardItemGrid from "@/components/ui/CardItemGrid";
import CardItemSlider from "@/components/ui/CardItemSlider";
import RatingStar from "@/components/ui/RatingStar";
import Reveal from "@/components/ui/Reveal";
import PromoSplitBanner from "@/app/(main)/_component/PromoSplitBanner";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import type { IFeaturedReview } from "@/@types/Home.type";
import type { IHomePromise } from "@/@types/StoreContent.type";
import type { ThemeHomeProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import Hero from "./Hero";
import BrandStory from "./BrandStory";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const BUBBLE_COUNT = 6;
// Bong bóng chat xoay vòng 3 nền — chữ ink trên cả 3 (trắng 12.07 / sky 8.87 / sand 9.93)
const BUBBLE_BG = [
  "bg-white",
  "bg-[rgb(var(--theme-sky))]",
  "bg-[rgb(var(--theme-sand))]",
];

// Dải cam kết chạy ngang. Mỗi nửa track = danh sách ×2 (đủ dài hơn viewport rộng), track = 2 nửa
// giống hệt → animate-marquee (-50%) lặp liền mạch. Chỉ bản đầu tiên cho screen reader đọc;
// reduced motion: đứng yên, chỉ còn bản đầu, xuống dòng thay vì bị cắt
function PromiseMarquee({ items }: { items: IHomePromise[] }) {
  const half = [...items, ...items];

  return (
    <section
      aria-label="Cam kết của cửa hàng"
      className="mt-6 md:mt-8 overflow-hidden border-y border-white-300"
    >
      <div className="flex w-max motion-safe:animate-marquee motion-safe:hover:[animation-play-state:paused] motion-reduce:w-auto">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className={cn(
              "flex shrink-0 motion-reduce:shrink motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center",
              copy === 1 && "motion-reduce:hidden"
            )}
          >
            {half.map((item, index) => {
              const repeat = index >= items.length;
              return (
                <li
                  key={index}
                  aria-hidden={(copy === 0 && repeat) || undefined}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 text-sm font-semibold text-dark-500 whitespace-nowrap",
                    repeat && "motion-reduce:hidden"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full bg-[rgb(var(--theme-sun))]"
                  />
                  {item.title}
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </section>
  );
}

// Ô danh mục bo tròn có ảnh — rỗng/lỗi → ẩn
async function CategoryTiles() {
  const categories = await fetchCategoriesCached();
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="cat-h" className="my-16 md:my-24">
      <Reveal>
        <div className="section-head mb-6">
          <h2
            id="cat-h"
            className="type-display-section font-display text-deep"
          >
            Mua theo danh mục
          </h2>
        </div>
      </Reveal>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
        {categories.map((category) => (
          <li key={category._id}>
            <Link
              href={
                category.slug
                  ? `${PATH.COLLECTION}?category=${encodeURIComponent(category.slug)}`
                  : PATH.COLLECTION
              }
              className={cn("group/cat block rounded-2xl", FOCUS_RING)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[rgb(var(--theme-sky))] shadow-card transition-shadow duration-300 group-hover/cat:shadow-card-hover motion-safe:transition-[transform,box-shadow] motion-safe:group-hover/cat:-translate-y-1">
                {category.imageUrl && (
                  <Image
                    src={resolveImageUrl(category.imageUrl)}
                    // Tên danh mục đã là chữ trong link — ảnh thuần minh họa
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/cat:scale-105"
                  />
                )}
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white px-3 py-2 text-center text-sm font-extrabold text-ink truncate">
                  {category.name}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Review dạng bong bóng chat — chỉ review có chữ (content, không thì title)
function ReviewBubbles({ reviews }: { reviews: IFeaturedReview[] }) {
  const bubbles = reviews
    .filter((review) => review.content || review.title)
    .slice(0, BUBBLE_COUNT);
  if (bubbles.length === 0) return null;

  return (
    <section aria-labelledby="reviews-h" className="my-16 md:my-24">
      <Reveal>
        <div className="section-head mb-8">
          <h2
            id="reviews-h"
            className="type-display-section font-display text-deep"
          >
            Hội chơi nói gì
          </h2>
          <p className="type-section-sub text-dark-500">
            Từ những đơn hàng đã xác nhận mua
          </p>
        </div>
      </Reveal>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {bubbles.map((review, index) => (
          <li key={review._id}>
            <figure className="flex flex-col h-full">
              <blockquote
                className={cn(
                  "flex-1 rounded-3xl rounded-bl-md p-5 text-ink shadow-card",
                  BUBBLE_BG[index % BUBBLE_BG.length]
                )}
              >
                <RatingStar rating={review.rating} classStar="w-3.5 h-3.5" />
                <p className="mt-3 leading-relaxed line-clamp-5 break-words">
                  {review.content || review.title}
                </p>
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-3 pl-2 min-w-0">
                <span
                  aria-hidden="true"
                  className="grid place-items-center size-10 shrink-0 rounded-full bg-ink text-white font-extrabold"
                >
                  {review.displayName.charAt(0)}
                </span>
                <span className="min-w-0 text-sm">
                  <span className="block font-extrabold text-ink truncate">
                    {review.displayName}
                  </span>
                  {review.productName && (
                    <span className="block text-dark-500 truncate">
                      Đã mua: {review.productName}
                    </span>
                  )}
                </span>
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

      {storeSettings.homePromises.length > 0 && (
        <PromiseMarquee items={storeSettings.homePromises} />
      )}

      <div className="container-base">
        <CategoryTiles />

        {bestSellers.length > 0 && (
          <Reveal>
            <ContentSlider
              title="Được yêu thích nhất"
              href={`${PATH.COLLECTION}?sort=bestseller`}
            >
              <CardItemSlider dataProduct={bestSellers} />
            </ContentSlider>
          </Reveal>
        )}

        {storeSettings.promoTiles.length > 0 && (
          <PromoSplitBanner tiles={storeSettings.promoTiles} />
        )}

        {saleProducts.length > 0 && (
          <Reveal>
            <ContentSlider title="Đang khuyến mãi" href={PATH.COLLECTION}>
              <CardItemGrid dataProduct={saleProducts} />
            </ContentSlider>
          </Reveal>
        )}

        <ReviewBubbles reviews={reviews} />
      </div>

      {storeSettings.brandStory && (
        <BrandStory story={storeSettings.brandStory} />
      )}
    </>
  );
}
