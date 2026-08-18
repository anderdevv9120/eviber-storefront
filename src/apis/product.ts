import axiosRequest from "@/config/axios";

export interface IGetProductsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
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
