import { describe, expect, it, vi } from "vitest";
import { TILE_THEME } from "./PromoSplitBanner";

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/link", () => ({ default: () => null }));

describe("promo tile themes", () => {
  it("keeps today's light and dark overlays", () => {
    expect(TILE_THEME.light).toEqual({
      overlayClass:
        "bg-gradient-to-r from-primary-100/95 via-primary-50/70 to-transparent",
      isDark: false,
    });
    expect(TILE_THEME.dark).toEqual({
      overlayClass:
        "bg-gradient-to-r from-dark-800/80 via-dark-800/40 to-transparent",
      isDark: true,
    });
  });
});
