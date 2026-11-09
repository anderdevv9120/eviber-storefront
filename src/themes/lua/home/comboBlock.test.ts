import { describe, expect, it } from "vitest";
import type { IComboCard } from "@/@types/Combo.type";
import { pickComboBlocks, toComboBlock } from "./comboBlock";

const combo = (overrides: Partial<IComboCard> = {}): IComboCard => ({
  _id: "c1",
  name: "Set công sở",
  slug: "set-cong-so",
  image: "cover.jpg",
  pieceImages: ["p1.jpg", "p2.jpg"],
  pieceCount: 2,
  hasChoice: false,
  pricing: { mode: "PERCENT", value: 20 },
  price: 1000000,
  originalPrice: 1250000,
  ...overrides,
});

describe("lua combo blocks", () => {
  it("maps price, struck price and saving", () => {
    const view = toComboBlock(
      combo({ slug: "set-a", price: 1290000, originalPrice: 1610000 })
    );
    expect(view.href).toBe("/combo/set-a");
    expect(view.price).toBe("1.290.000đ");
    expect(view.originalPrice).toBe("1.610.000đ");
    expect(view.saving).toBe("Tiết kiệm 320.000đ");
  });

  it("out of stock hides price and saving", () => {
    const view = toComboBlock(
      combo({ slug: "het", price: null, originalPrice: null })
    );
    expect(view.price).toBeNull();
    expect(view.originalPrice).toBeNull();
    expect(view.saving).toBeNull();
    expect(view.href).toBe("/combo/het");
  });

  it("no discount shows no struck price", () => {
    for (const originalPrice of [500000, null]) {
      const view = toComboBlock(combo({ price: 500000, originalPrice }));
      expect(view.price).toBe("500.000đ");
      expect(view.originalPrice).toBeNull();
      expect(view.saving).toBeNull();
    }
  });

  it("image falls back to first piece", () => {
    expect(
      toComboBlock(combo({ image: null, pieceImages: ["a.jpg", "b.jpg"] }))
        .image
    ).toBe("a.jpg");
    expect(toComboBlock(combo({ image: null, pieceImages: [] })).image).toBe(
      null
    );
  });

  it("strip keeps at most 3 pieces", () => {
    const view = toComboBlock(
      combo({ pieceImages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"] })
    );
    expect(view.pieces).toEqual(["1.jpg", "2.jpg", "3.jpg"]);
  });

  it("pickComboBlocks caps at 2 and handles short lists", () => {
    const views = pickComboBlocks([
      combo({ slug: "a" }),
      combo({ slug: "b" }),
      combo({ slug: "c" }),
    ]);
    expect(views.map((v) => v.href)).toEqual(["/combo/a", "/combo/b"]);
    expect(pickComboBlocks([combo({ slug: "a" })])).toHaveLength(1);
    expect(pickComboBlocks([])).toEqual([]);
  });
});
