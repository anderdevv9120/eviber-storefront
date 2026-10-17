import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const sessionCookies = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = sessionCookies.get(name);
      return value === undefined ? undefined : { value };
    },
  }),
}));

const cases: {
  label: string;
  tokens: Record<string, string>;
  expected: boolean;
}[] = [
  { label: "guest", tokens: {}, expected: false },
  {
    label: "access-only",
    tokens: { accessToken: "private-access" },
    expected: true,
  },
  {
    label: "refresh-only",
    tokens: { refreshToken: "private-refresh" },
    expected: true,
  },
  {
    label: "both tokens",
    tokens: { accessToken: "private-access", refreshToken: "private-refresh" },
    expected: true,
  },
  {
    label: "empty cookies",
    tokens: { accessToken: "", refreshToken: "" },
    expected: false,
  },
];

beforeEach(() => sessionCookies.clear());

describe("session presence", () => {
  it.each(cases)(
    "$label returns only a non-cacheable session hint",
    async ({ tokens, expected }) => {
      for (const [key, value] of Object.entries(tokens))
        sessionCookies.set(key, value);
      const response = await GET();
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ hasSession: expected });
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.has("Set-Cookie")).toBe(false);
    }
  );
});
