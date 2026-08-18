export * from "./misc";
export * from "./service";

export const NUMBER_REGEX = /^-?\d*\.?\d*$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";
// Ghi nhớ lựa chọn "Lưu đăng nhập": "1" = cookie persistent, "0" = session cookie
export const REMEMBER_ME = "rememberMe";
export const TOKEN = "token";
