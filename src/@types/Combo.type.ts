import type { ICartAttributeValue } from "./Cart.type";
import type { IProductOption, IProductVariant } from "./Product.type";

export interface IComboPricing {
  mode: "PERCENT" | "FIXED";
  value: number;
}

/** BE: ComboCard — prices are per combo, null when out of stock. */
export interface IComboCard {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  pieceImages: string[];
  pieceCount: number;
  hasChoice: boolean;
  pricing: IComboPricing;
  price: number | null;
  originalPrice: number | null;
}

export interface IComboDetailItem {
  productId: string;
  quantity: number;
  mode: "LOCKED" | "CHOOSE";
  variantId: string | null;
  product: {
    _id: string;
    name: string;
    slug: string;
    image: string | null;
    refundEnabled: boolean;
    options: IProductOption[];
  };
  variants: IProductVariant[];
}

export interface IComboDetail extends IComboCard {
  description: string;
  images: string[];
  seo: { metaTitle: string; metaDescription: string; metaKeywords: string[] };
  availability: "AVAILABLE" | "OUT_OF_STOCK";
  items: IComboDetailItem[];
}

export interface ICartComboPiece {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string | null;
  attributeValues: ICartAttributeValue[];
  itemQuantity: number;
  /** Totals for this piece's itemQuantity in ONE combo, not unit prices. */
  lineTotal: number;
  originalPrice: number;
}

/** BE: CartComboLine — price / originalPrice are per ONE combo. */
export interface ICartComboLine {
  lineId: string;
  comboId: string;
  name: string;
  slug: string;
  image: string | null;
  quantity: number;
  price: number;
  originalPrice: number;
  isAvailable: boolean;
  unavailableReason:
    "COMBO_CHANGED" | "COMBO_UNAVAILABLE" | "OUT_OF_STOCK" | null;
  availableQuantity: number;
  pieces: ICartComboPiece[];
}

/** BE: CheckoutComboLine (order.interface.ts). */
export type ICheckoutReviewCombo = Pick<
  ICartComboLine,
  | "lineId"
  | "comboId"
  | "name"
  | "slug"
  | "image"
  | "quantity"
  | "price"
  | "originalPrice"
  | "pieces"
> & {
  picks: { productId: string; variantId: string; itemQuantity: number }[];
};

/** BE: OrderCombo snapshot (order.model.ts). */
export interface IOrderCombo {
  comboGroupId: string;
  comboId: string;
  nameAtOrder: string;
  slugAtOrder?: string;
  imageAtOrder?: string;
  quantity: number;
  pricingModeAtOrder: IComboPricing["mode"];
  pricingValueAtOrder: number;
  totalAtOrder: number;
}
