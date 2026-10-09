import axiosRequest from "@/config/axios";

/** Footer/home/product — BE trả defaults khi admin chưa lưu */
export const getStoreSettings = () => {
  return axiosRequest.get("/store-settings");
};

/** 404 = slug lạ hoặc trang chưa xuất bản */
export const getPolicy = (slug: string) => {
  return axiosRequest.get(`/policies/${encodeURIComponent(slug)}`);
};
