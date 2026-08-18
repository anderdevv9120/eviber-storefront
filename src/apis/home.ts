import axiosRequest from "@/config/axios";

export const getCategory = () => {
  return axiosRequest.get("/categories");
};
