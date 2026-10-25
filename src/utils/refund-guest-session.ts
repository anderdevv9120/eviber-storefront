import type { RefundGuestSession } from "@/@types/Refund.type";

const storageKey = (orderNumber: string) =>
  `eviber:refund-guest-session:${orderNumber}`;

// Dự phòng khi trình duyệt chặn sessionStorage: giữ phiên hiện tại trong bộ nhớ tab,
// tuyệt đối không rơi về localStorage (sẽ sống lâu hơn phiên 24h của một tab)
const memory = new Map<string, RefundGuestSession>();

// Truy cập `sessionStorage` có thể throw (SecurityError) ngay ở bước đọc property
const withStorage = <T>(run: (storage: Storage) => T): T | undefined => {
  try {
    return run(sessionStorage);
  } catch {
    return undefined;
  }
};

const parse = (raw: string | null | undefined): RefundGuestSession | null => {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { sessionToken, expiresAt } = value as Record<string, unknown>;
    if (typeof sessionToken !== "string" || !sessionToken) return null;
    if (typeof expiresAt !== "string" || Number.isNaN(Date.parse(expiresAt)))
      return null;
    return { sessionToken, expiresAt };
  } catch {
    return null;
  }
};

/** Phiên còn hạn của đúng đơn này; dữ liệu hỏng hoặc hết hạn bị xóa và coi như chưa có */
export const readRefundGuestSession = (
  orderNumber: string,
  now: number
): RefundGuestSession | null => {
  const key = storageKey(orderNumber);
  const stored = parse(withStorage((storage) => storage.getItem(key)));
  const session = stored ?? memory.get(key) ?? null;
  if (session && Date.parse(session.expiresAt) > now) return session;
  clearRefundGuestSession(orderNumber);
  return null;
};

export const saveRefundGuestSession = (
  orderNumber: string,
  session: RefundGuestSession
): void => {
  const key = storageKey(orderNumber);
  memory.set(key, session);
  withStorage((storage) => storage.setItem(key, JSON.stringify(session)));
};

/** Chỉ xóa phiên của đơn này — các đơn khác trong tab giữ nguyên */
export const clearRefundGuestSession = (orderNumber: string): void => {
  const key = storageKey(orderNumber);
  memory.delete(key);
  withStorage((storage) => storage.removeItem(key));
};
