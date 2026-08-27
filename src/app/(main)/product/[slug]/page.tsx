import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import {
  getDetailProduct,
  getDetailProductBySlug,
  getProducts,
} from "@/apis/product";
import { getProductReviews } from "@/apis/review";
import {
  IProductDetailResponse,
  IProductListItem,
} from "@/@types/Product.type";
import { IProductReviewsResponse } from "@/@types/Review.type";
import { ApiError } from "@/config/axios";
import { PATH } from "@/constants/paths";
import ProductGallery from "./_component/ProductGallery";
import ProductHeader from "./_component/ProductHeader";
import ProductForm from "./_component/ProductForm";
import ProductUsp from "./_component/ProductUsp";
import ProductDescription from "./_component/ProductDescription";
import { REVIEW_PAGE_SIZE } from "@/constants";
import ReviewSection from "./_component/ReviewSection";
import RelatedProducts from "./_component/RelatedProducts";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3030";
const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;
const RELATED_LIMIT = 10;

const EMPTY_REVIEWS: IProductReviewsResponse = {
  items: [],
  total: 0,
  page: 1,
  pageSize: REVIEW_PAGE_SIZE,
  summary: { ratingAvg: 0, total: 0, ratingCounts: {} },
};

// null CHỈ cho 404 thật (slug không tồn tại → notFound); lỗi transient (BE down,
// 5xx, timeout) phải THROW — trả null là ISR cache trang 404 đè bản stale tốt
// suốt chu kỳ revalidate
const rethrowUnlessNotFound = (error: unknown): null => {
  if (error instanceof ApiError && error.status === 404) return null;
  throw error;
};

// Dedupe giữa generateMetadata và Page trong cùng lượt render (React cache)
const fetchProductBySlug = cache(
  async (slug: string): Promise<IProductDetailResponse | null> => {
    try {
      const res = await getDetailProductBySlug(slug);
      return res?.data ?? null;
    } catch (error) {
      return rethrowUnlessNotFound(error);
    }
  }
);

// Trang 1 review render server (SEO thấy content) — đổi trang/lọc sao fetch client
// trong ReviewSection. Khác fetch product chính: section PHỤ lỗi thì fallback rỗng
// chứ không throw — không để review/related giết cả trang
async function fetchInitialReviews(
  productId: string
): Promise<IProductReviewsResponse> {
  try {
    const res = await getProductReviews({
      productId,
      page: 1,
      pageSize: REVIEW_PAGE_SIZE,
    });
    return res?.data ?? EMPTY_REVIEWS;
  } catch {
    return EMPTY_REVIEWS;
  }
}

// Đi qua GET /products (filter category slug) thay vì by-category id — kế thừa
// quy ước list bỏ sản phẩm hết hàng của rail; lỗi/rỗng → [] để section tự ẩn
async function fetchRelatedProducts(
  categorySlug: string,
  currentProductId: string
): Promise<IProductListItem[]> {
  try {
    const res = await getProducts({
      category: categorySlug,
      pageSize: RELATED_LIMIT + 1,
    });
    const items: IProductListItem[] = res?.data?.data ?? [];
    return items
      .filter((item) => item._id !== currentProductId)
      .slice(0, RELATED_LIMIT);
  } catch {
    return [];
  }
}

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };

  const title = product.seo?.metaTitle ?? product.name;
  const description =
    product.seo?.metaDescription ??
    (product.description
      ? stripHtml(product.description).slice(0, 160)
      : `Mua ${product.name} chính hãng, giao toàn quốc, đổi size miễn phí 30 ngày.`);
  const canonical = `${PATH.PRODUCT}/${product.slug}`;
  const images = product.images.length ? [product.images[0]] : undefined;

  return {
    title,
    description,
    keywords: product.seo?.metaKeywords,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function Product({
  params,
}: {
  params: { slug: string };
}) {
  const productDetail = await fetchProductBySlug(params.slug);
  if (!productDetail) {
    // Link từ lịch sử đơn hàng chỉ có productId (order snapshot không lưu slug)
    // → resolve theo id rồi đưa về URL slug canonical; segment khác (kể cả
    // dạng slug-id cũ) rơi thẳng xuống 404
    if (OBJECT_ID_REGEX.test(params.slug)) {
      const byId = await getDetailProduct(params.slug)
        .then((res) => (res?.data ?? null) as IProductDetailResponse | null)
        .catch(rethrowUnlessNotFound);
      if (byId) redirect(`${PATH.PRODUCT}/${byId.slug}`);
    }
    notFound();
  }

  const isInStock = productDetail.variants.some((v) => v.inventoryCount > 0);
  const categorySlug = productDetail.categoryIds[0]?.slug;
  const [initialReviews, relatedProducts] = await Promise.all([
    fetchInitialReviews(productDetail._id),
    categorySlug
      ? fetchRelatedProducts(categorySlug, productDetail._id)
      : Promise.resolve([]),
  ]);
  const reviewSummary = initialReviews.summary;

  const plainDescription = productDetail.description
    ? stripHtml(productDetail.description)
    : undefined;
  const prices = productDetail.variants.map((v) => v.price);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productDetail.name,
    image: productDetail.images,
    description: plainDescription,
    url: `${SITE_URL}${PATH.PRODUCT}/${productDetail.slug}`,
    ...(prices.length && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "VND",
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: prices.length,
        availability: isInStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    }),
    // Chỉ khai khi có review thật — đồng bộ rating hiển thị ở ProductHeader
    ...(reviewSummary.total > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewSummary.ratingAvg,
        reviewCount: reviewSummary.total,
      },
    }),
  };

  return (
    // container-narrow: trang product gói 1260px (modifier dùng chung các màn đọc-nhiều)
    <div className="container-base container-narrow">
      <script
        type="application/ld+json"
        // Escape "<" chặn breakout "</script>" nếu name/description chứa markup
        // (data hiện từ seed trusted — đây là defense-in-depth rẻ)
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2 xl:gap-12 mt-6 md:mt-10">
        {/* key: client-nav PDP→PDP (rail Related) không remount component cùng vị trí
            — thiếu key là state variant/ảnh của sản phẩm cũ dính sang sản phẩm mới */}
        <ProductGallery
          key={productDetail._id}
          images={productDetail.images}
          name={productDetail.name}
        />

        {/* min-w-0: chặn min-content con banh cột grid (cùng lý do với gallery) */}
        <div className="min-w-0">
          <ProductHeader
            title={productDetail.name}
            rating={
              reviewSummary.total > 0 ? reviewSummary.ratingAvg : undefined
            }
            reviewCount={reviewSummary.total}
            soldCount={productDetail.soldCount}
            isInStock={isInStock}
          />
          <ProductForm
            key={productDetail._id}
            options={productDetail.options}
            variants={productDetail.variants}
          />
          {/* Cam kết ngay dưới CTA (chốt A-F5b) — thay band USP full-width cũ */}
          <div className="mt-6 lg:mt-8">
            <ProductUsp />
          </div>
        </div>
      </div>

      {productDetail.description && (
        <div className="mt-12 md:mt-16">
          <ProductDescription
            key={params.slug}
            descriptionHtml={productDetail.description}
          />
        </div>
      )}

      <div className="mt-12 md:mt-16">
        <ReviewSection
          key={productDetail._id}
          productId={productDetail._id}
          initialData={initialReviews}
        />
      </div>

      <div className="mt-12 md:mt-16">
        <RelatedProducts products={relatedProducts} />
      </div>

      <div className="pb-12 md:pb-16" />
    </div>
  );
}
