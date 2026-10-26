import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ComboStrip from "./ComboStrip";

vi.mock("@/apis/combo", () => ({ getCombos: vi.fn() }));

describe("collection combo strip", () => {
  it("renders no heading or section before combos are available", () => {
    expect(
      renderToStaticMarkup(
        createElement(ComboStrip, { categoryKey: "giay-dep" })
      )
    ).toBe("");
  });
});
