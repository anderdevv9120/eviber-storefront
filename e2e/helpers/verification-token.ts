import { createHmac } from "crypto";
import { backendEnv } from "./backend-env";

const base64Url = (value: string) => Buffer.from(value).toString("base64url");

// E2e không có mailbox nên tự ký verification token y hệt BE
// (auth.service sendVerificationEmailAsync: HS256, payload {email, type, iat})
// thay cho link trong email — cần secret thật từ .env của backend.
export function signVerificationToken(email: string): string {
  const secret = backendEnv("VERIFY_TOKEN_SECRET") || backendEnv("JWT_SECRET");
  if (!secret) {
    throw new Error(
      "Không đọc được VERIFY_TOKEN_SECRET/JWT_SECRET từ backend/.env"
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      email,
      type: "email_verification",
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}
