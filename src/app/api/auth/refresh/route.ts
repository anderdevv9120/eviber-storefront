import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN, REMEMBER_ME } from "@/constants";
import { API_URL } from "@/config/api-url";

// Refresh token là httpOnly cookie nên client không đọc được —
// route này đọc cookie server-side, gọi BE refresh rồi set lại cặp cookie mới.
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    // code để client phân biệt "chưa có phiên" với "phiên hết hạn/không hợp lệ"
    return NextResponse.json(
      { message: "Refresh token not found", code: "NO_REFRESH_TOKEN" },
      { status: 401 }
    );
  }

  try {
    const res = await axios.post(
      `${API_URL}/auth/refresh-token`,
      { refreshToken }
    );
    const {
      accessToken,
      accessExpiresIn,
      refreshToken: newRefreshToken,
      refreshExpiresIn,
    } = res.data.data;

    // Giữ nguyên tính chất phiên user đã chọn lúc login ("Lưu đăng nhập"):
    // phiên session (rememberMe=0) không được nâng cấp thành persistent khi refresh
    const rememberMe = cookieStore.get(REMEMBER_ME)?.value !== "0";
    const baseCookie = { secure: true, sameSite: "strict", path: "/" } as const;

    cookieStore.set(ACCESS_TOKEN, accessToken, {
      ...baseCookie,
      ...(rememberMe ? { maxAge: accessExpiresIn / 1000 } : {}),
    });

    cookieStore.set(REFRESH_TOKEN, newRefreshToken, {
      ...baseCookie,
      httpOnly: true,
      ...(rememberMe ? { maxAge: refreshExpiresIn / 1000 } : {}),
    });

    return NextResponse.json({ data: { accessToken } });
  } catch (error) {
    const status =
      axios.isAxiosError(error) && error.response ? error.response.status : 500;

    // Chỉ xóa phiên khi token thực sự bị BE từ chối — lỗi tạm thời (5xx, mạng)
    // không được logout user, giữ cookie để lần gọi sau retry
    if (status === 401 || status === 403) {
      cookieStore.delete(ACCESS_TOKEN);
      cookieStore.delete(REFRESH_TOKEN);
      cookieStore.delete(REMEMBER_ME);
    }
    return NextResponse.json({ message: "Refresh token failed" }, { status });
  }
}
