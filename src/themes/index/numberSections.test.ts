import { describe, expect, it } from "vitest";
import { numberSections } from "./numberSections";

describe("numberSections", () => {
  it("numbers the rendered sections in home order", () => {
    expect(
      numberSections(["categories", "bestSellers", "sale", "story", "reviews"])
    ).toEqual({
      categories: "01",
      bestSellers: "02",
      sale: "03",
      story: "04",
      reviews: "05",
    });
  });

  it("skips hidden sections without leaving gaps", () => {
    expect(
      numberSections(["categories", false, "sale", false, "reviews"])
    ).toEqual({
      categories: "01",
      sale: "02",
      reviews: "03",
    });
  });

  it("starts at 01 when the category section is hidden", () => {
    expect(numberSections([false, "bestSellers", false, "story"])).toEqual({
      bestSellers: "01",
      story: "02",
    });
  });

  it("returns no headings when all sections are hidden", () => {
    expect(numberSections([false, false])).toEqual({});
    expect(numberSections([])).toEqual({});
  });
});
