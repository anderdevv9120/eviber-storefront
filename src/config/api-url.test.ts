import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("showcase API URL", () => {
  it("prefers the showcase backend URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SHOWCASE_API_URL", "https://api.test/api/pickleball/v1");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://legacy.test/api/v1");

    const { API_URL } = await import("./api-url");
    expect(API_URL).toBe("https://api.test/api/pickleball/v1");
  });

  it("falls back to the existing API URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SHOWCASE_API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://legacy.test/api/v1");

    const { API_URL } = await import("./api-url");
    expect(API_URL).toBe("https://legacy.test/api/v1");
  });
});
