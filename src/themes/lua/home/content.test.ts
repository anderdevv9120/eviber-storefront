import { describe, expect, it } from "vitest";
import { COMBO_SLOT_COPY, heroCollageSides } from "./content";

// Copy slot cứng nhưng combo trong slot là combo mới nhất bất kỳ: không được hứa điều combo thật có thể không có
describe("COMBO_SLOT_COPY", () => {
  it.each(COMBO_SLOT_COPY.map((copy, slot) => [slot, copy.description]))(
    "slot %i description promises no saving or size choice",
    (_slot, description) => {
      expect(description).not.toMatch(/tiết kiệm|chọn size/i);
    }
  );
});

describe("heroCollageSides", () => {
  it("matches the middle photo by id whatever the query string", () => {
    const sides = heroCollageSides(
      "https://images.unsplash.com/photo-1678700266327-8959be9622fd?w=1800&h=1000&crop=faces"
    );
    expect(sides).toHaveLength(2);
  });

  it("returns undefined for CMS uploads and unknown photos", () => {
    expect(heroCollageSides("/uploads/banner.jpg")).toBeUndefined();
    expect(
      heroCollageSides("https://images.unsplash.com/photo-1-abc?w=900")
    ).toBeUndefined();
  });
});
