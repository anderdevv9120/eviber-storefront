import type {
  IComboDetailItem,
  IComboPricing,
  IOrderCombo,
} from "@/@types/Combo.type";
import type {
  ICheckoutReview,
  IMakeOrderPayload,
  IOrderProduct,
} from "@/@types/Order.type";
import type { IProductVariant } from "@/@types/Product.type";

export interface Totals {
  normal: number;
  combo: number;
}

/** Match backend whole-VND normalization before per-unit discounts and quantity. */
export function comboTotals(
  pricing: IComboPricing,
  pieces: Array<{ price: number; quantity: number }>
): Totals {
  const value = Math.floor(pricing.value);
  const normal = pieces.reduce(
    (sum, { price, quantity }) => sum + Math.floor(price) * quantity,
    0
  );
  const combo =
    pricing.mode === "FIXED"
      ? Math.min(value, normal)
      : pieces.reduce(
          (sum, { price, quantity }) =>
            sum +
            Math.floor((Math.floor(price) * (100 - value)) / 100) * quantity,
          0
        );
  return { normal, combo };
}

export type GroupedOrderLine =
  | { kind: "product"; line: IOrderProduct }
  | {
      kind: "combo";
      combo: IOrderCombo;
      pieces: Array<{
        product: IOrderProduct;
        productId: IOrderProduct["productId"];
        variantId: IOrderProduct["variantId"];
        name: IOrderProduct["productNameAtOrder"];
        attributes: string;
        quantity: number;
        lineTotal: number;
        unitPrice: number | null;
      }>;
    };

export function groupOrderProducts(
  productInfo: IOrderProduct[],
  combos: IOrderCombo[] = []
): GroupedOrderLine[] {
  const snapshots = new Map(
    combos.map((combo) => [String(combo.comboGroupId), combo])
  );
  const groups = new Map<
    string,
    Extract<GroupedOrderLine, { kind: "combo" }>
  >();
  const result: GroupedOrderLine[] = [];

  for (const line of productInfo) {
    const groupId = String(line.comboGroupId);
    const combo = snapshots.get(groupId);
    if (!combo) {
      result.push({ kind: "product", line });
      continue;
    }

    let group = groups.get(groupId);
    if (!group) {
      group = { kind: "combo", combo, pieces: [] };
      groups.set(groupId, group);
      result.push(group);
    }

    const piece = group.pieces.find(
      (piece) => String(piece.variantId) === String(line.variantId)
    );
    if (piece) {
      piece.quantity += line.quantity;
      piece.lineTotal += line.priceAtOrder * line.quantity;
      if (piece.unitPrice !== line.priceAtOrder) piece.unitPrice = null;
    } else {
      group.pieces.push({
        product: line,
        productId: line.productId,
        variantId: line.variantId,
        name: line.productNameAtOrder,
        attributes: (line.attributeValuesAtOrder ?? [])
          .map((attr) => attr.value)
          .join(" · "),
        quantity: line.quantity,
        lineTotal: line.priceAtOrder * line.quantity,
        unitPrice: line.priceAtOrder,
      });
    }
  }

  return result;
}

export function isPicksComplete(
  items: Pick<IComboDetailItem, "productId" | "mode">[],
  picks: Record<string, string>
): boolean {
  return items.every(
    (item) => item.mode === "LOCKED" || Boolean(picks[item.productId])
  );
}

export function maxComboQuantity(
  items: Pick<
    IComboDetailItem,
    "productId" | "quantity" | "mode" | "variantId"
  >[],
  picks: Record<string, string>,
  variantsById: Record<string, Pick<IProductVariant, "inventoryCount">>
): number {
  if (!items.length) return 0;
  return Math.min(
    ...items.map((item) => {
      const variantId =
        item.mode === "LOCKED" ? item.variantId : picks[item.productId];
      const variant = variantId ? variantsById[variantId] : undefined;
      return variant ? Math.floor(variant.inventoryCount / item.quantity) : 0;
    })
  );
}

export function variantsForQuantity(
  variants: IProductVariant[],
  itemQuantity: number
): IProductVariant[] {
  return variants.map((variant) =>
    variant.inventoryCount < itemQuantity
      ? { ...variant, inventoryCount: 0 }
      : variant
  );
}

export function toExpectedComboItems(
  review: ICheckoutReview
): NonNullable<IMakeOrderPayload["expectedComboItems"]> {
  return review.combos.map(({ comboId, quantity, picks }) => ({
    comboId,
    quantity,
    picks: picks.map(({ productId, variantId }) => ({ productId, variantId })),
  }));
}
