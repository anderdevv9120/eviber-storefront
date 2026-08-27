import axiosRequest from "@/config/axios";

export interface IGetProductsParams {
  page?: number;
  pageSize?: number;
  /** Field của product (name/created_at/updated_at/soldCount) hoặc "price" (sort theo preview price) */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  /** true → chỉ sản phẩm có variant ACTIVE đang giảm giá (rail Đang khuyến mãi) */
  onSale?: boolean;
  /** CSV slug danh mục (vd "quan-nam,giay-dep") — slug lạ → kết quả rỗng */
  category?: string;
  /** Giá tối thiểu (ĐỒNG, integer ≥ 0) — lọc theo giá hiển thị (variant ACTIVE rẻ nhất) */
  priceMin?: number;
  /** Giá tối đa (ĐỒNG, integer ≥ 0) — cùng ngữ nghĩa priceMin */
  priceMax?: number;
}

export const getProducts = (
  params?: IGetProductsParams,
  signal?: AbortSignal
) => {
  return axiosRequest.get("/products", { params, signal });
};

export const getDetailProduct = (id: string) => {
  return axiosRequest.get(`/products/${id}`);
};

/** PDP theo URL slug thuần — 404 khi slug không tồn tại hoặc product không PUBLISH */
export const getDetailProductBySlug = (slug: string) => {
  return axiosRequest.get(`/products/by-slug/${slug}`);
};
