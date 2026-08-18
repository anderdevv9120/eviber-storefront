import axiosRequest from "@/config/axios";

export interface IAddressProps {
  name: string;
  city: string;
  district: string;
  ward: string;
  specificAddress: string;
  phoneNumber: string;
  zip: string;
  primary: boolean;
}

export interface IUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// AccountForm hiển thị lỗi inline → toastError: false cho các endpoint nó dùng

export const updateUserInfo = (data: IUserData) => {
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

export const getAddresses = () => {
  return axiosRequest.get(`users/address`);
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
  return axiosRequest.post("users/change-password", data);
};
