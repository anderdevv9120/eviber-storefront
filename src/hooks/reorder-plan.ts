import type { IOrderCombo } from "@/@types/Combo.type";
import type { IOrderProduct } from "@/@types/Order.type";
import { groupOrderProducts } from "@/utils/combo";

type ProductEntry = { variantId: string; quantity: number };

export type ReorderEntry =
  | ({ kind: "product" } & ProductEntry)
  | {
      kind: "combo";
      comboId: string;
      quantity: number;
      picks: { productId: string; variantId: string }[];
      fallback: ProductEntry[];
    };

export function planReorder(
  productInfo: IOrderProduct[],
  combos?: IOrderCombo[]
): ReorderEntry[] {
  return groupOrderProducts(productInfo, combos).map((group) =>
    group.kind === "product"
      ? {
          kind: "product",
          variantId: group.line.variantId,
          quantity: group.line.quantity,
        }
      : {
          kind: "combo",
          comboId: group.combo.comboId,
          quantity: group.combo.quantity,
          picks: group.pieces.map(({ productId, variantId }) => ({
            productId,
            variantId,
          })),
          fallback: group.pieces.map(({ variantId, quantity }) => ({
            variantId,
            quantity,
          })),
        }
  );
}
