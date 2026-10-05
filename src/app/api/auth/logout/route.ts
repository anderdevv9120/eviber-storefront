import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN, REMEMBER_ME } from "@/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Đổi refresh token lấy cặp mới — dùng khi access token thiếu/hết hạn mà vẫn cần gọi BE logout
async function refreshPair(refreshToken: string): Promise<TokenPair> {
  const res = await axios.post(`${API_URL}/auth/refresh-token`, {
    refreshToken,
  });
  return {
    accessToken: res.data.data.accessToken,
    refreshToken: res.data.data.refreshToken,
  };
}

async function revokeSession(pair: TokenPair): Promise<void> {
  await axios.post(
    `${API_URL}/auth/logout`,
    { refreshToken: pair.refreshToken },
    { headers: { Authorization: `Bearer ${pair.accessToken}` } }
  );
}

// Logout: revoke ĐÚNG phiên hiện tại phía BE (refresh token là httpOnly nên phải đi qua đây),
// rồi xóa cookie phiên. Revoke thất bại vẫn xóa cookie — logout phía client luôn hoàn tất.
export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN)?.value;

  if (refreshToken) {
    try {
      if (accessToken) {
        try {
          await revokeSession({ accessToken, refreshToken });
        } catch (error) {
          // Access token hết hạn → refresh (rotate phiên) rồi revoke bằng cặp mới
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            await revokeSession(await refreshPair(refreshToken));
          }
        }
      } else {
        await revokeSession(await refreshPair(refreshToken));
      }
    } catch {
      // BE down / phiên đã bị revoke từ trước — không chặn logout phía client
    }
  }

  cookieStore.delete(ACCESS_TOKEN);
  cookieStore.delete(REFRESH_TOKEN);
  cookieStore.delete(REMEMBER_ME);

  return NextResponse.json({ message: "Logged out" });
}
