import type { ReactNode } from "react";
import Link from "next/link";
import { fetchCategoriesCached } from "@/apis/home.server";
import CardItemGrid from "@/components/ui/CardItemGrid";
import CustomerReview from "@/components/ui/CustomerReview";
import Reveal from "@/components/ui/Reveal";
import UspStrip from "@/app/(main)/_component/UspStrip";
import PromoSplitBanner from "@/app/(main)/_component/PromoSplitBanner";
import { PATH } from "@/constants/paths";
import type { ThemeHomeProps } from "@/themes/types";
import Hero from "./Hero";
import BrandStory from "./BrandStory";
import { numberSections } from "./numberSections";

function Section({
  number,
  title,
  href,
  children,
}: {
  number: string;
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="my-12 md:my-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t border-ink pt-5">
        <Reveal>
          <h2 className="type-display-section font-display text-ink">
            <span className="mr-4 text-sm font-medium tracking-normal tabular-nums">
              {number}
            </span>
            {title}
          </h2>
        </Reveal>
        {href && (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 hover:decoration-[rgb(var(--theme-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Xem tất cả{" "}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function Home({
  banners,
  saleProducts,
  bestSellers,
  reviews,
  storeSettings,
}: ThemeHomeProps) {
  const categories = await fetchCategoriesCached();
  const numbers = numberSections([
    categories.length > 0 && "categories",
    bestSellers.length > 0 && "bestSellers",
    saleProducts.length > 0 && "sale",
    storeSettings.brandStory !== null && "story",
    reviews.length > 0 && "reviews",
  ]);

  return (
    <>
      <Hero banners={banners} />
      <div className="container-base motion-reduce:[&_*]:!transition-none motion-reduce:[&_img]:!transform-none">
        {numbers.categories && (
          <Section number={numbers.categories} title="Danh mục">
            <nav
              aria-label="Mua theo danh mục"
              className="grid grid-cols-2 border-l border-t border-ink sm:grid-cols-3 lg:grid-cols-4"
            >
              {categories.map((category, index) => (
                <Link
                  key={category._id}
                  href={
                    category.slug
                      ? `${PATH.COLLECTION}?category=${encodeURIComponent(category.slug)}`
                      : PATH.COLLECTION
                  }
                  className="flex min-h-[100px] min-w-0 flex-col justify-between gap-4 border-b border-r border-ink p-4 hover:bg-ink hover:text-white focus-visible:bg-ink focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--theme-accent))]"
                >
                  <span className="text-xs tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="break-words text-sm font-semibold">
                    {category.name}
                  </span>
                </Link>
              ))}
            </nav>
          </Section>
        )}
        {numbers.bestSellers && (
          <Section
            number={numbers.bestSellers}
            title="Bán chạy"
            href={`${PATH.COLLECTION}?sort=bestseller`}
          >
            <CardItemGrid dataProduct={bestSellers} />
          </Section>
        )}
        {numbers.sale && (
          <Section
            number={numbers.sale}
            title="Khuyến mãi"
            href={`${PATH.COLLECTION}?onSale=true`}
          >
            <CardItemGrid dataProduct={saleProducts} />
          </Section>
        )}
        {numbers.story && storeSettings.brandStory && (
          <Section number={numbers.story} title="Câu chuyện">
            <BrandStory story={storeSettings.brandStory} />
          </Section>
        )}
        {numbers.reviews && (
          <Section number={numbers.reviews} title="Phản hồi">
            <CustomerReview reviews={reviews} />
          </Section>
        )}
        {storeSettings.promoTiles.length > 0 && (
          <div className="my-12 border-y border-ink py-6">
            <PromoSplitBanner tiles={storeSettings.promoTiles} />
          </div>
        )}
        {storeSettings.homePromises.length > 0 && (
          <UspStrip items={storeSettings.homePromises} />
        )}
      </div>
    </>
  );
}
