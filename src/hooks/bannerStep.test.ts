import { describe, expect, it } from "vitest";
import { stepIndex } from "./bannerStep";

describe("stepIndex", () => {
  it("returns 0 when there are no banners", () => {
    expect(stepIndex(0, 0, 1)).toBe(0);
  });
  it("returns 0 for a single banner", () => {
    expect(stepIndex(0, 1, 1)).toBe(0);
  });
  it("wraps forward past the last banner", () => {
    expect(stepIndex(2, 3, 1)).toBe(0);
  });
  it("wraps backward before the first banner", () => {
    expect(stepIndex(0, 3, -1)).toBe(2);
  });
  it("steps forward in the middle", () => {
    expect(stepIndex(1, 3, 1)).toBe(2);
  });
});
