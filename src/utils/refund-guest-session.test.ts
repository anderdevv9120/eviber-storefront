import { afterEach, describe, expect, it, vi } from "vitest";
import type { RefundGuestSession } from "@/@types/Refund.type";
import {
  clearRefundGuestSession,
  readRefundGuestSession,
  saveRefundGuestSession,
} from "./refund-guest-session";

const NOW = Date.parse("2026-10-24T10:00:00.000Z");
const session = (
  overrides: Partial<RefundGuestSession> = {}
): RefundGuestSession => ({
  sessionToken: "session-secret",
  expiresAt: "2026-10-25T10:00:00.000Z",
  ...overrides,
});

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
};

afterEach(() => {
  for (const order of ["ORD-1", "ORD-2"]) clearRefundGuestSession(order);
  vi.unstubAllGlobals();
});

describe("refund guest session storage", () => {
  it("keeps each order's session under its own sessionStorage key", () => {
    const storage = fakeStorage();
    vi.stubGlobal("sessionStorage", storage);
    saveRefundGuestSession("ORD-1", session());
    expect(readRefundGuestSession("ORD-1", NOW)).toEqual(session());
    expect(readRefundGuestSession("ORD-2", NOW)).toBeNull();
    saveRefundGuestSession("ORD-2", session({ sessionToken: "other" }));
    expect(storage.data.size).toBe(2);
    expect(readRefundGuestSession("ORD-1", NOW)?.sessionToken).toBe(
      "session-secret"
    );
    clearRefundGuestSession("ORD-1");
    expect(readRefundGuestSession("ORD-1", NOW)).toBeNull();
    expect(readRefundGuestSession("ORD-2", NOW)?.sessionToken).toBe("other");
  });

  it("drops an expired session at the exact expiry instant and removes it", () => {
    const storage = fakeStorage();
    vi.stubGlobal("sessionStorage", storage);
    saveRefundGuestSession("ORD-1", session());
    const expiry = Date.parse(session().expiresAt);
    expect(readRefundGuestSession("ORD-1", expiry - 1)).not.toBeNull();
    expect(readRefundGuestSession("ORD-1", expiry)).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  it.each([
    ["not json", "{oops"],
    ["null", "null"],
    ["array", "[]"],
    [
      "missing token",
      JSON.stringify({ expiresAt: "2026-10-25T10:00:00.000Z" }),
    ],
    ["empty token", JSON.stringify(session({ sessionToken: "" }))],
    ["numeric token", JSON.stringify({ ...session(), sessionToken: 7 })],
    ["unparseable expiry", JSON.stringify(session({ expiresAt: "soon" }))],
  ])(
    "treats malformed stored data (%s) as no session and clears it",
    (_, raw) => {
      const storage = fakeStorage({ "eviber:refund-guest-session:ORD-1": raw });
      vi.stubGlobal("sessionStorage", storage);
      expect(readRefundGuestSession("ORD-1", NOW)).toBeNull();
      expect(storage.data.size).toBe(0);
    }
  );

  it("keeps the session in memory when storage is blocked and never falls back to localStorage", () => {
    const touched = vi.fn();
    vi.stubGlobal("localStorage", new Proxy({}, { get: touched }));
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    });
    try {
      saveRefundGuestSession("ORD-1", session());
      expect(readRefundGuestSession("ORD-1", NOW)).toEqual(session());
      expect(readRefundGuestSession("ORD-2", NOW)).toBeNull();
      clearRefundGuestSession("ORD-1");
      expect(readRefundGuestSession("ORD-1", NOW)).toBeNull();
    } finally {
      Reflect.deleteProperty(globalThis, "sessionStorage");
    }
    expect(touched).not.toHaveBeenCalled();
  });

  it("survives a storage that throws on write by keeping the current session in memory", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      removeItem: () => undefined,
    });
    saveRefundGuestSession("ORD-1", session());
    expect(readRefundGuestSession("ORD-1", NOW)).toEqual(session());
  });
});
