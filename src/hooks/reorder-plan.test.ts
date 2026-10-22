import { describe, expect, it } from "vitest";
import type { IOrderCombo } from "@/@types/Combo.type";
import type { IOrderProduct } from "@/@types/Order.type";
import { planReorder } from "./reorder-plan";

const product = (
  variantId: string,
  quantity: number,
  comboGroupId?: string,
  priceAtOrder = 100
): IOrderProduct => ({
  productId: variantId.split("-")[0],
  variantId,
  quantity,
  comboGroupId,
  priceAtOrder,
  originalPriceAtOrder: 200,
});

const combo = (comboGroupId: string): IOrderCombo => ({
  comboGroupId,
  comboId: "outfit",
  nameAtOrder: "Áo và quần",
  quantity: 2,
  pricingModeAtOrder: "FIXED",
  pricingValueAtOrder: 250,
  totalAtOrder: 500,
});

describe("planReorder", () => {
  it("plans one combo with distinct picks and summed, already-scaled fallback quantities", () => {
    const lines = [
      product("shirt-m", 1),
      product("shirt-m", 2, "g1", 83),
      product("jeans-xl", 2, "g1", 83),
      product("shirt-m", 2, "g1", 84),
    ];
    const headers = [combo("g1")];
    const before = structuredClone({ lines, headers });

    expect(planReorder(lines, headers)).toEqual([
      { kind: "product", variantId: "shirt-m", quantity: 1 },
      {
        kind: "combo",
        comboId: "outfit",
        quantity: 2,
        picks: [
          { productId: "shirt", variantId: "shirt-m" },
          { productId: "jeans", variantId: "jeans-xl" },
        ],
        fallback: [
          { variantId: "shirt-m", quantity: 4 },
          { variantId: "jeans-xl", quantity: 2 },
        ],
      },
    ]);
    expect({ lines, headers }).toEqual(before);
  });

  it("keeps legacy orders as product entries with no combo snapshots", () => {
    const lines = [product("shirt-m", 3), product("jeans-xl", 1)];
    const expected = [
      { kind: "product", variantId: "shirt-m", quantity: 3 },
      { kind: "product", variantId: "jeans-xl", quantity: 1 },
    ];
    expect(planReorder(lines)).toEqual(expected);
    expect(planReorder(lines, [])).toEqual(expected);
  });

  it("keeps separate combo groups even when their combo and variant identities match", () => {
    expect(
      planReorder(
        [product("shirt-m", 4, "g1"), product("shirt-m", 2, "g2")],
        [combo("g2"), combo("g1")]
      )
    ).toMatchObject([
      { kind: "combo", fallback: [{ variantId: "shirt-m", quantity: 4 }] },
      { kind: "combo", fallback: [{ variantId: "shirt-m", quantity: 2 }] },
    ]);
  });

  it("preserves orphaned lines as products rather than dropping them", () => {
    expect(planReorder([product("shirt-m", 2, "missing")])).toEqual([
      { kind: "product", variantId: "shirt-m", quantity: 2 },
    ]);
  });

  it("returns no entries for an empty order", () => {
    expect(planReorder([])).toEqual([]);
  });
});
