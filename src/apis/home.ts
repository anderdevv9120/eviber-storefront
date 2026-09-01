import axiosRequest from "@/config/axios";

export const getCategory = () => {
  return axiosRequest.get("/categories");
};

/** Hero carousel home — BE trả banner isActive, đã sort theo sortOrder */
export const getBanners = () => {
  return axiosRequest.get("/banners");
};

/** Review nổi bật home — BE trả tối đa 12 review APPROVED mới nhất + summary */
export const getFeaturedReviews = () => {
  return axiosRequest.get("/reviews/featured");
};
