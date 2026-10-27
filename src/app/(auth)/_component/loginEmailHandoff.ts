// Email vừa đăng ký chuyển sang màn Login qua sessionStorage, không qua URL (lọt vào history / log máy chủ)
const KEY = "auth.loginEmail";

export const rememberLoginEmail = (email: string) => {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Trình duyệt chặn storage: khách tự gõ lại email
  }
};

/** Đọc một lần rồi xóa — mở Login lần sau không bị điền email cũ */
export const takeLoginEmail = (): string => {
  try {
    const email = sessionStorage.getItem(KEY) ?? "";
    sessionStorage.removeItem(KEY);
    return email;
  } catch {
    return "";
  }
};
