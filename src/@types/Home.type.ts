/**
 * Contract các section màn home — đối chiếu BE:
 * - IBanner            → modules/banner/banner.model.ts (GET /banners)
 * - IFeaturedReview*   → modules/review/review.interface.ts (GET /reviews/featured)
 * - ICategoryItem      → modules/category/category.model.ts (GET /categories)
 */

export interface IBanner {
  _id: string;
  image: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  sortOrder?: number;
}

export interface IFeaturedReview {
  _id: string;
  displayName: string;
  rating: number;
  title?: string;
  content?: string;
  /** Ảnh do khách upload kèm review — home chưa dùng (cover lấy productImage) */
  images: string[];
  productName: string | null;
  /** Ảnh đại diện của SẢN PHẨM được review — cover card polaroid */
  productImage: string | null;
}

export interface IFeaturedReviewsResponse {
  reviews: IFeaturedReview[];
  summary: {
    ratingAvg: number;
    total: number;
  };
}

export interface ICategoryItem {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}
