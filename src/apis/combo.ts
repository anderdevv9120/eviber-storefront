import axiosRequest from "@/config/axios";

export const getCombos = (params: {
  category?: string;
  page?: number;
  pageSize?: number;
}) => {
  return axiosRequest.get("/combos", { params });
};

export const getComboBySlug = (slug: string) => {
  return axiosRequest.get(`/combos/by-slug/${slug}`);
};
