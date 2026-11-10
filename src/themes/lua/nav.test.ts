import { describe, expect, it } from "vitest";
import { activeCollectionKey, categoryHref } from "./nav";

describe("activeCollectionKey", () => {
  it("is null outside /collection even with a category param", () => {
    expect(activeCollectionKey("/", "ao-nam")).toBeNull();
    expect(activeCollectionKey("/product/x", null)).toBeNull();
  });

  it('is "" on /collection without category (Tất cả sản phẩm)', () => {
    expect(activeCollectionKey("/collection", null)).toBe("");
  });

  it("is the category slug on /collection?category=", () => {
    expect(activeCollectionKey("/collection", "ao-nam")).toBe("ao-nam");
  });
});

describe("categoryHref", () => {
  it("encodes the slug and falls back to bare collection", () => {
    expect(categoryHref("áo nam")).toBe("/collection?category=%C3%A1o%20nam");
    expect(categoryHref(undefined)).toBe("/collection");
  });
});
