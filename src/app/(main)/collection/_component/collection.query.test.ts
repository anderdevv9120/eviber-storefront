import { describe, expect, it } from "vitest";
import { parseCollectionQuery, shouldShowComboStrip } from "./collection.query";

describe("shouldShowComboStrip", () => {
  it("hides combos without a category", () => {
    expect(shouldShowComboStrip(parseCollectionQuery({}))).toBe(false);
  });

  it("hides combos during category search", () => {
    expect(
      shouldShowComboStrip(
        parseCollectionQuery({ category: "ao", search: "linen" })
      )
    ).toBe(false);
  });

  it("shows combos for selected categories", () => {
    expect(
      shouldShowComboStrip(parseCollectionQuery({ category: "ao,quan" }))
    ).toBe(true);
  });

  it.each(["bestseller", "priceAsc", "priceDesc"])(
    "keeps combos visible with price filters and sort %s",
    (sort) => {
      expect(
        shouldShowComboStrip(
          parseCollectionQuery({
            category: "ao",
            priceMin: "100000",
            priceMax: "500000",
            sort,
          })
        )
      ).toBe(true);
    }
  );
});
