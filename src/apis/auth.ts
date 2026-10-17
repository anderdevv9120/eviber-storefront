import axiosRequest, { REFRESH_LOCK_NAME } from "@/config/axios";
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

export const getSession = () => {
  return axios.get<{ hasSession: boolean }>("/api/auth");
};

export const getProfile = () => {
  return axiosRequest.get("/auth/profile", { toastError: false });
};

// rememberMe=false → route handler set SESSION cookie (đóng browser là hết phiên);
// true (mặc định — Google OAuth không có toggle) → cookie persistent theo expiresIn của BE
export const setTokenServer = (data: object, rememberMe: boolean = true) => {
  return axios.post("/api/auth", { data, rememberMe });
};

// Logout qua route handler: revoke đúng phiên hiện tại phía BE (refresh token là httpOnly)
// rồi xóa cặp cookie phiên — luôn hoàn tất phía client kể cả khi BE từ chối.
// Bọc trong CÙNG Web Lock với refresh: nếu interceptor đang refresh dở, logout chờ
// rotate xong mới chạy — tránh revoke trượt phiên mới + cookie bị Set-Cookie của
// refresh khôi phục lại sau khi đã xóa
export const logoutServer = () => {
  const doLogout = () => axios.post("/api/auth/logout");
  if (typeof navigator === "undefined" || !navigator.locks) {
    return doLogout();
  }
  return navigator.locks.request(REFRESH_LOCK_NAME, doLogout);
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
  getSession,
  getProfile,
  resetPassword,
  forgotPassword,
  setTokenServer,
  logoutServer,
  verifyEmail,
  resendVerifyEmail,
};

export default authAPI;
