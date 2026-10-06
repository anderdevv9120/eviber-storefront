import { describe, expect, it } from "vitest";
import { resolveImageUrl } from "./resolveImageUrl";

describe("resolveImageUrl", () => {
  const api = "http://localhost:3009/api/v1";

  it("leaves absolute URLs untouched", () => {
    expect(resolveImageUrl("https://images.unsplash.com/a.jpg", api)).toBe(
      "https://images.unsplash.com/a.jpg"
    );
    expect(resolveImageUrl("http://cdn.test/a.jpg", api)).toBe(
      "http://cdn.test/a.jpg"
    );
  });

  it("prefixes uploaded paths with the API origin, dropping the API path", () => {
    expect(resolveImageUrl("/images/hero_1.jpg", api)).toBe(
      "http://localhost:3009/images/hero_1.jpg"
    );
    expect(
      resolveImageUrl("/images/hero_1.jpg", "https://x-ecom.xyz/api/v1")
    ).toBe("https://x-ecom.xyz/images/hero_1.jpg");
  });

  it("returns the path unchanged when no API URL is configured", () => {
    expect(resolveImageUrl("/images/hero_1.jpg", "")).toBe(
      "/images/hero_1.jpg"
    );
  });
});
