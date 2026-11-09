import { describe, expect, it } from "vitest";
import { COMBO_SLOT_COPY } from "./content";

// Copy slot cứng nhưng combo trong slot là combo mới nhất bất kỳ: không được hứa điều combo thật có thể không có
describe("COMBO_SLOT_COPY", () => {
  it.each(COMBO_SLOT_COPY.map((copy, slot) => [slot, copy.description]))(
    "slot %i description promises no saving or size choice",
    (_slot, description) => {
      expect(description).not.toMatch(/tiết kiệm|chọn size/i);
    }
  );
});
