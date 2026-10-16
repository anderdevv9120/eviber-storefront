import { describe, expect, it, vi } from "vitest";
import { TILE_THEME } from "./PromoSplitBanner";

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({ default: () => null }));

describe("promo tile themes", () => {
  it("keeps light and dark overlays dense enough for AA text over photos", () => {
    expect(TILE_THEME.light).toEqual({
      overlayClass:
        "bg-gradient-to-r from-primary-100/95 via-primary-50/85 to-transparent",
      isDark: false,
    });
    expect(TILE_THEME.dark).toEqual({
      overlayClass:
        "bg-gradient-to-r from-dark-800/90 via-dark-800/70 via-40% to-transparent",
      isDark: true,
    });
  });
});
