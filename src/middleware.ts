import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants/index";
import { PATH } from "./constants/paths";

const AUTH_PATHS = [PATH.LOGIN, PATH.REGISTER];

export function middleware(request: NextRequest) {
  // accessToken hết hạn nhưng refreshToken (httpOnly) còn → vẫn là phiên hợp lệ,
  // cho qua để client tự refresh khi gọi API (single-flight trong config/axios.ts)
  const hasSession =
    Boolean(cookies().get(ACCESS_TOKEN)?.value) ||
    Boolean(cookies().get(REFRESH_TOKEN)?.value);
  const { pathname } = request.nextUrl;

  // /cart KHÔNG guard: guest cart là thiết kế chính thức (BE sessionId + TTL + merge khi login).
  if (!hasSession && pathname.startsWith("/user")) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url));
  }

  if (hasSession && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/user/:path*"],
};
