import axiosRequest from "@/config/axios";
import axios from "axios";

// Các endpoint auth hiển thị lỗi inline trong form (hoặc tự toast message riêng)
// → toastError: false để interceptor không toast global trùng lặp

export const login = (data: { email: string; password: string }) => {
  return axiosRequest.post("/auth/login", data, { toastError: false });
};

// verify-email đi bằng axios thuần (KHÔNG qua interceptor unwrap/toast) — token hết hạn
// BE trả 400 kèm `response.data.errors = { action: 'resend', email }` để màn hiện nút
// gửi lại đúng email; interceptor chung reject chỉ còn message string, mất field này.
// Response 200 vì thế cũng ở dạng thô: res.data.data = { success, message }.
export const verifyEmail = (data: { token: string }) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
    data
  );
};

export const resendVerifyEmail = (data: { email: string }) => {
  return axiosRequest.post("/auth/resend-verification", data, {
    toastError: false,
  });
};

export const googleCallback = (code: string) => {
  return axiosRequest.get(`/auth/google/callback?code=${code}`, {
    toastError: false,
  });
};

export const register = (data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) => {
  return axiosRequest.post("/auth/register", data, { toastError: false });
};

export const getProfile = () => {
  return axiosRequest.get("/auth/profile", { toastError: false });
};

// rememberMe=false → route handler set SESSION cookie (đóng browser là hết phiên);
// true (mặc định — Google OAuth không có toggle) → cookie persistent theo expiresIn của BE
export const setTokenServer = (data: object, rememberMe: boolean = true) => {
  return axios.post("/api/auth", { data, rememberMe });
};

export const deleteTokenServer = async () => {
  try {
    const res = await axios.delete("/api/auth");
    return res;
  } catch (error) {
    console.log("errors", error);
  }
};

export const forgotPassword = (email: string) => {
  return axiosRequest.post(
    "/auth/forgot-password",
    { email },
    { toastError: false }
  );
};

export const resetPassword = (data: { newPassword: string; token: string }) => {
  return axiosRequest.post("/auth/forgot-password/reset-password", data, {
    toastError: false,
  });
};

const authAPI = {
  login,
  register,
  getProfile,
  resetPassword,
  forgotPassword,
  setTokenServer,
  deleteTokenServer,
  verifyEmail,
  resendVerifyEmail,
};

export default authAPI;
