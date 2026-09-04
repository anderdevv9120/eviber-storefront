import { AxiosRequestConfig } from "axios";
import axiosRequest from "@/config/axios";

export interface IAddressProps {
  name: string;
  city: string;
  // Địa giới 2 cấp không còn huyện. FE LUÔN gửi "" (không bỏ field): BE PUT merge
  // từng key, bỏ field là huyện cũ của địa chỉ 3 cấp còn nguyên trong DB
  district?: string;
  ward: string;
  specificAddress: string;
  phoneNumber: string;
  zip: string;
  primary: boolean;
}

export type TGender = "MALE" | "FEMALE" | "OTHER";

// Email cố tình KHÔNG nằm trong payload update — email là định danh đăng nhập,
// đổi email cần flow verify riêng (Backlog); FE hiển thị read-only.
export interface IUpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  imgUrl?: string;
  gender?: TGender;
}

// AccountForm hiển thị lỗi inline → toastError: false cho các endpoint nó dùng

export const updateUserInfo = (data: IUpdateProfilePayload) => {
  return axiosRequest.put(`users/profile`, data, { toastError: false });
};

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosRequest.post("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    toastError: false,
  });
};

// Mặc định không toast: my-address hiển thị lỗi tải inline kèm nút thử lại,
// checkout cũng tự xử lý; caller cần toast thì truyền config đè lại
export const getAddresses = (config?: AxiosRequestConfig) => {
  return axiosRequest.get(`users/address`, { toastError: false, ...config });
};

export const getUser = () => {
  return axiosRequest.get(`users/profile`, { toastError: false });
};

// BE nhận addressId là `_id` của address subdocument (không phải array index)
export const getAddress = (addressId: string) => {
  return axiosRequest.get(`users/address/${addressId}`);
};

export const createAddress = (formAddress: IAddressProps) => {
  return axiosRequest.post(`users/address`, formAddress);
};

export const editAddress = (
  addressId: string,
  data: IAddressProps & { country?: string }
) => {
  return axiosRequest.put(`users/address/${addressId}`, data);
};

export const deleteAddress = (addressId: string) => {
  return axiosRequest.delete(`users/address/${addressId}`);
};

export const changePassword = (data: {
  newPassword: string;
  oldPassword: string;
}) => {
  return axiosRequest.post("users/change-password", data, {
    toastError: false,
  });
};
