// Đọc hạn (exp → ms epoch) từ JWT mà KHÔNG verify chữ ký — chỉ dùng cho quyết định
// UX phía client (token thật vẫn do BE verify). Trả null nếu token không decode được.
export function decodeJwtExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
