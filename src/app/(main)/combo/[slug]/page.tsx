import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { IComboDetail } from "@/@types/Combo.type";
import { getComboBySlug } from "@/apis/combo";
import { ApiError } from "@/config/axios";
import { PATH } from "@/constants/paths";
import ProductGallery from "../../product/[slug]/_component/ProductGallery";
import ProductDescription from "../../product/[slug]/_component/ProductDescription";
import ComboForm from "./_component/ComboForm";

export const revalidate = 300;

const fetchComboBySlug = cache(
  async (slug: string): Promise<IComboDetail | null> => {
    try {
      const response = await getComboBySlug(slug);
      return response?.data ?? null;
    } catch (error) {
      // Transient API failures must throw so ISR never caches a false 404.
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }
);

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const combo = await fetchComboBySlug(slug);
  if (!combo) return { title: "Không tìm thấy combo" };

  const title = combo.seo.metaTitle || combo.name;
  const description =
    combo.seo.metaDescription ||
    stripHtml(combo.description).slice(0, 160) ||
    `Mua combo ${combo.name} với giá ưu đãi.`;
  const canonical = `${PATH.COMBO}/${combo.slug}`;
  const images = combo.images.length
    ? [combo.images[0]]
    : combo.pieceImages.length
      ? [combo.pieceImages[0]]
      : undefined;

  return {
    title,
    description,
    keywords: combo.seo.metaKeywords,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ComboPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const combo = await fetchComboBySlug(slug);
  if (!combo) notFound();

  const images = combo.images.length ? combo.images : combo.pieceImages;

  return (
    <div className="container-base container-narrow">
      <div className="grid gap-8 lg:grid-cols-2 xl:gap-12 mt-6 md:mt-10">
        <ProductGallery key={combo._id} images={images} name={combo.name} />
        <div className="min-w-0">
          <h1 className="type-display-page font-display max-md:leading-snug">
            {combo.name}
          </h1>
          <ComboForm key={combo._id} combo={combo} />
        </div>
      </div>
      {combo.description && (
        <div className="mt-12 md:mt-16">
          <ProductDescription descriptionHtml={combo.description} />
        </div>
      )}
      <div className="pb-12 md:pb-16" />
    </div>
  );
}
