import { describe, expect, it } from "vitest";
import type { IComboPricing, IOrderCombo } from "@/@types/Combo.type";
import type { ICheckoutReview, IOrderProduct } from "@/@types/Order.type";
import type { IProductVariant } from "@/@types/Product.type";
import {
  comboTotals,
  groupOrderProducts,
  isPicksComplete,
  maxComboQuantity,
  toExpectedComboItems,
  variantsForQuantity,
} from "./combo";

const items = [
  {
    productId: "shirt",
    mode: "LOCKED" as const,
    variantId: "shirt-m",
    quantity: 2,
  },
  { productId: "jeans", mode: "CHOOSE" as const, variantId: null, quantity: 1 },
];
const variant = (id: string, inventoryCount: number): IProductVariant => ({
  id,
  productId: "shirt",
  sku: id,
  status: "ACTIVE",
  price: 159000,
  originalPrice: 199000,
  discountPercentage: 20,
  inventoryCount,
  attributeValues: [],
  created_at: "2026-10-21T00:00:00Z",
  updated_at: "2026-10-21T00:00:00Z",
});
const header = (comboGroupId: string): IOrderCombo => ({
  comboGroupId,
  comboId: "outfit",
  nameAtOrder: "Outfit",
  quantity: 1,
  pricingModeAtOrder: "FIXED",
  pricingValueAtOrder: 400000,
  totalAtOrder: 400000,
});
const line = (priceAtOrder: number, comboGroupId?: string): IOrderProduct => ({
  productId: "shirt",
  variantId: "shirt-m",
  quantity: 1,
  productNameAtOrder: "Shirt",
  attributeValuesAtOrder: [{ name: "Size", value: "M" }],
  priceAtOrder,
  originalPriceAtOrder: 159000,
  ...(comboGroupId ? { comboGroupId } : {}),
});

describe("comboTotals", () => {
  it.each<{
    pricing: IComboPricing;
    pieces: { price: number; quantity: number }[];
    normal: number;
    combo: number;
  }>([
    {
      pricing: { mode: "PERCENT", value: 15 },
      pieces: [
        { price: 159000, quantity: 1 },
        { price: 399000, quantity: 1 },
      ],
      normal: 558000,
      combo: 474300,
    },
    {
      pricing: { mode: "PERCENT", value: 15 },
      pieces: [{ price: 99999, quantity: 1 }],
      normal: 99999,
      combo: 84999,
    },
    {
      pricing: { mode: "PERCENT", value: 15 },
      pieces: [{ price: 99999, quantity: 2 }],
      normal: 199998,
      combo: 169998,
    },
    {
      pricing: { mode: "FIXED", value: 499000 },
      pieces: [
        { price: 159000, quantity: 1 },
        { price: 399000, quantity: 1 },
        { price: 259000, quantity: 1 },
      ],
      normal: 817000,
      combo: 499000,
    },
    {
      pricing: { mode: "FIXED", value: 400000 },
      pieces: [
        { price: 159000, quantity: 2 },
        { price: 199000, quantity: 1 },
      ],
      normal: 517000,
      combo: 400000,
    },
    {
      pricing: { mode: "FIXED", value: 999999 },
      pieces: [
        { price: 159000, quantity: 1 },
        { price: 399000, quantity: 1 },
      ],
      normal: 558000,
      combo: 558000,
    },
    {
      pricing: { mode: "FIXED", value: 1 },
      pieces: [{ price: 0, quantity: 2 }],
      normal: 0,
      combo: 0,
    },
    {
      pricing: { mode: "FIXED", value: 99 },
      pieces: [
        { price: 0, quantity: 2 },
        { price: 100, quantity: 1 },
      ],
      normal: 100,
      combo: 99,
    },
    {
      pricing: { mode: "FIXED", value: 6999999999 },
      pieces: [
        { price: 4000000000, quantity: 1 },
        { price: 3000000001, quantity: 1 },
      ],
      normal: 7000000001,
      combo: 6999999999,
    },
  ])(
    "$pricing.mode $pricing.value returns exact integer totals $combo",
    ({ pricing, pieces, normal, combo }) => {
      expect(comboTotals(pricing, pieces)).toEqual({ normal, combo });
    }
  );

  it("caps fixed totals over 500 deterministic integer VND cases", () => {
    let seed = 13;
    const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
    for (let i = 0; i < 500; i++) {
      const pieces = Array.from({ length: 2 + (next() % 19) }, () => ({
        price: next() % 1000000001,
        quantity: 1 + (next() % 10),
      }));
      const normal = pieces.reduce(
        (sum, piece) => sum + piece.price * piece.quantity,
        0
      );
      const value = 1 + (next() % (2 * normal || 1));
      const result = comboTotals({ mode: "FIXED", value }, pieces);
      expect(result).toEqual({ normal, combo: Math.min(value, normal) });
      expect(Number.isSafeInteger(result.combo)).toBe(true);
    }
  });
});

describe("combo picks and inventory", () => {
  it("requires every choose pick, but locked picks are implicit", () => {
    expect(isPicksComplete(items, {})).toBe(false);
    expect(isPicksComplete(items, { jeans: "" })).toBe(false);
    expect(isPicksComplete(items, { jeans: "jeans-xl" })).toBe(true);
    expect(isPicksComplete([items[0]], {})).toBe(true);
  });

  it("takes the minimum whole-combo stock using the implicit locked variant", () => {
    expect(
      maxComboQuantity(
        items,
        { jeans: "jeans-xl", shirt: "wrong" },
        {
          "shirt-m": variant("shirt-m", 5),
          "jeans-xl": variant("jeans-xl", 8),
        }
      )
    ).toBe(2);
  });

  it("returns zero when a choose pick cannot cover its item quantity", () => {
    expect(
      maxComboQuantity(
        [{ ...items[1], quantity: 2 }],
        { jeans: "jeans-xl" },
        {
          "jeans-xl": variant("jeans-xl", 1),
        }
      )
    ).toBe(0);
  });

  it("returns zero for missing picks, missing variants, or no items", () => {
    expect(
      maxComboQuantity(items, {}, { "shirt-m": variant("shirt-m", 5) })
    ).toBe(0);
    expect(maxComboQuantity(items, { jeans: "missing" }, {})).toBe(0);
    expect(maxComboQuantity([], {}, {})).toBe(0);
  });

  it("masks insufficient stock for VariantSelector without changing source variants", () => {
    const variants = [
      variant("low", 1),
      variant("exact", 2),
      variant("high", 5),
    ];
    const result = variantsForQuantity(variants, 2);
    expect(result.map((v) => v.inventoryCount)).toEqual([0, 2, 5]);
    expect(result[0]).toEqual({ ...variants[0], inventoryCount: 0 });
    expect(variants.map((v) => v.inventoryCount)).toEqual([1, 2, 5]);
  });

  it("keeps zero stock disabled and stock one selectable for item quantity one", () => {
    expect(
      variantsForQuantity([variant("zero", 0), variant("one", 1)], 1).map(
        (v) => v.inventoryCount
      )
    ).toEqual([0, 1]);
  });
});

describe("groupOrderProducts", () => {
  it("merges split allocations inside a combo at its first piece position", () => {
    const normal = line(159000);
    const between = { ...line(199000), variantId: "jeans-xl" };
    const lines = [
      normal,
      line(123018, "g1"),
      between,
      line(123017, "g1"),
      line(123018, "g1"),
    ];
    const before = structuredClone(lines);
    expect(groupOrderProducts(lines, [header("g1")])).toEqual([
      { kind: "product", line: normal },
      {
        kind: "combo",
        combo: header("g1"),
        pieces: [
          {
            productId: "shirt",
            variantId: "shirt-m",
            name: "Shirt",
            attributes: "M",
            quantity: 3,
            lineTotal: 369053,
            unitPrice: null,
          },
        ],
      },
      { kind: "product", line: between },
    ]);
    expect(lines).toEqual(before);
  });

  it("keeps equal allocations priced and identical variants in different groups separate", () => {
    const result = groupOrderProducts(
      [line(100, "g1"), line(100, "g2"), line(100, "g1")],
      [header("g2"), header("g1")]
    );
    expect(result).toMatchObject([
      {
        kind: "combo",
        combo: { comboGroupId: "g1" },
        pieces: [{ quantity: 2, lineTotal: 200, unitPrice: 100 }],
      },
      {
        kind: "combo",
        combo: { comboGroupId: "g2" },
        pieces: [{ quantity: 1, lineTotal: 100, unitPrice: 100 }],
      },
    ]);
  });

  it("keeps legacy and orphaned lines flat without a matching combo header", () => {
    const lines = [line(100), line(101, "orphan"), line(100)];
    const expected = lines.map((line) => ({ kind: "product", line }));
    expect(groupOrderProducts(lines)).toEqual(expected);
    expect(groupOrderProducts(lines, [])).toEqual(expected);
    expect(groupOrderProducts(lines, [header("unused")])).toEqual(expected);
  });

  it("keeps piece order, quantities and attribute labels, including old snapshots", () => {
    const first = {
      ...line(100, "g1"),
      quantity: 2,
      attributeValuesAtOrder: [
        { name: "Size", value: "M" },
        { name: "Color", value: "Blue" },
      ],
    };
    const second = {
      ...line(200, "g1"),
      variantId: "jeans-xl",
      productId: "jeans",
      attributeValuesAtOrder: undefined,
      productNameAtOrder: undefined,
    };
    expect(groupOrderProducts([first, second], [header("g1")])).toMatchObject([
      {
        kind: "combo",
        pieces: [
          {
            variantId: "shirt-m",
            attributes: "M · Blue",
            quantity: 2,
            lineTotal: 200,
          },
          {
            variantId: "jeans-xl",
            name: undefined,
            attributes: "",
            quantity: 1,
            lineTotal: 200,
          },
        ],
      },
    ]);
  });
});

describe("toExpectedComboItems", () => {
  const review: ICheckoutReview = {
    subtotal: 800000,
    shippingFee: 0,
    discountAmount: 0,
    totalPrice: 800000,
    products: [],
    combos: [
      {
        lineId: "cart-line",
        comboId: "outfit",
        name: "Outfit",
        slug: "outfit",
        image: null,
        quantity: 2,
        price: 400000,
        originalPrice: 517000,
        pieces: [],
        picks: [
          { productId: "shirt", variantId: "shirt-m", itemQuantity: 2 },
          { productId: "jeans", variantId: "jeans-xl", itemQuantity: 1 },
        ],
      },
    ],
  };

  it("sends only combo identity, quantity and picks, dropping prices and itemQuantity", () => {
    const before = structuredClone(review);
    expect(toExpectedComboItems(review)).toEqual([
      {
        comboId: "outfit",
        quantity: 2,
        picks: [
          { productId: "shirt", variantId: "shirt-m" },
          { productId: "jeans", variantId: "jeans-xl" },
        ],
      },
    ]);
    expect(review).toEqual(before);
  });

  it("returns an empty expectation for a normal-only checkout review", () => {
    expect(toExpectedComboItems({ ...review, combos: [] })).toEqual([]);
  });
});
