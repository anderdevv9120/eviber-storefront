import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN, REFRESH_TOKEN, REMEMBER_ME } from "@/constants";

const BASE_COOKIE = {
  secure: true,
  sameSite: "strict",
  path: "/",
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, accessExpiresIn, refreshToken, refreshExpiresIn } =
      body.data;
    // rememberMe=false → KHÔNG set maxAge: session cookie, đóng browser là hết phiên.
    // Cookie REMEMBER_ME lưu lựa chọn để /api/auth/refresh giữ nguyên tính chất
    // phiên khi phát cặp cookie mới (không "nâng cấp" session thành persistent).
    const rememberMe: boolean = body.rememberMe !== false;

    cookies().set(ACCESS_TOKEN, accessToken, {
      ...BASE_COOKIE,
      ...(rememberMe ? { maxAge: accessExpiresIn / 1000 } : {}),
    });

    cookies().set(REFRESH_TOKEN, refreshToken, {
      ...BASE_COOKIE,
      httpOnly: true,
      ...(rememberMe ? { maxAge: refreshExpiresIn / 1000 } : {}),
    });

    cookies().set(REMEMBER_ME, rememberMe ? "1" : "0", {
      ...BASE_COOKIE,
      httpOnly: true,
      ...(rememberMe ? { maxAge: refreshExpiresIn / 1000 } : {}),
    });

    return NextResponse.json({ message: "Cookies set successfully!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    cookies().delete(ACCESS_TOKEN);
    cookies().delete(REFRESH_TOKEN);
    cookies().delete(REMEMBER_ME);

    return NextResponse.json({ message: "Cookies deleted successfully!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
