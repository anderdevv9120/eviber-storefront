/**
 * ===== CONTRACT MỚI — khớp BE thật =====
 * Đối chiếu: x-ecommerce-backend/src/modules/product/product.interface.ts,
 * product.service.ts (getListProduct/attachPreviewVariants, getProductById),
 * product-variant.model.ts. Giá/tồn kho nằm ở VARIANT — product KHÔNG có price.
 */

/** BE: ProductStatus / ProductVariantStatus (product.constant.ts) */
export type ProductApiStatus = "PUBLISH" | "UNPUBLISH" | "DRAFT" | "DELETED";
export type VariantApiStatus = "ACTIVE" | "INACTIVE";

/**
 * Item trong GET /products và GET /products/by-category/:categoryId.
 * BE select name/slug/images rồi gắn preview variant RẺ NHẤT (attachPreviewVariants):
 * price/originalPrice/discountPercentage undefined nếu product chưa có variant ACTIVE.
 */
export interface IProductListItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  soldCount?: number;
  /** Rating trung bình từ review APPROVED — undefined khi chưa có review, card tự ẩn stars */
  rating?: number;
}

/** AttributeValue đã populate trong variant — BE populate('attributeValues', 'value meta attributeId') */
export interface IVariantAttributeValue {
  _id: string;
  value: string;
  meta?: string;
  attributeId: string;
}

/**
 * Variant trong GET /products/:id.
 * LƯU Ý: ProductVariantSchema toJSON xóa `_id` nhưng bật virtuals → id là VIRTUAL `id` (string),
 * kèm virtual discountPercentage. Chỉ variant ACTIVE được trả về.
 */
export interface IProductVariant {
  id: string;
  productId: string;
  sku: string;
  status: VariantApiStatus;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  inventoryCount: number;
  image?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
  attributeValues: IVariantAttributeValue[];
  created_at: string;
  updated_at: string;
}

/** Category đã populate trong product detail — BE populate('categoryIds') */
export interface IProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

/** Attribute đã populate trong option — BE populate('options.attributeId', 'name code') */
export interface IProductOptionAttribute {
  _id: string;
  name: string;
  code: string;
}

/** Option của product (nhóm attribute + các value khả dụng) — BE: ProductOption embedded */
export interface IProductOption {
  attributeId: IProductOptionAttribute;
  optionValues: string[];
}

/**
 * Response GET /products/:id — BE trả {...product.toObject(), variants}.
 * product.toObject() GIỮ _id (toJSON transform không áp cho toObject).
 */
export interface IProductDetailResponse {
  _id: string;
  name: string;
  slug: string;
  status: ProductApiStatus;
  description?: string;
  images: string[];
  soldCount?: number;
  categoryIds: IProductCategory[];
  options: IProductOption[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  variants: IProductVariant[];
  created_at: string;
  updated_at: string;
}

/**
 * ===== LEGACY — shape cũ KHÔNG khớp BE (product không có price/inventoryCount) =====
 * Còn được các màn chưa migrate dùng. Sẽ xóa khi màn cuối chuyển sang contract mới
 * (task checkout-order). KHÔNG dùng cho code mới.
 * @deprecated dùng IProductListItem / IProductDetailResponse
 */
export interface IProductDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  inventoryCount: number;
  images: string[];
  slug: string;
  attributes?: string[];
  discount: number;
  rating?: number;
  isFavorite?: boolean;
  disabled?: boolean;
  optionColor?: { value: string; label: string }[];
}
