import type { IComboCard } from "@/@types/Combo.type";
import { PATH } from "@/constants/paths";
import { formatPrice } from "@/utils/formatPrice";

/** Data đã định dạng cho 1 khối combo split của home lua */
export interface ComboBlockView {
  href: string;
  name: string;
  /** Path thô — nơi render tự resolveImageUrl; null = panel nền trơn */
  image: string | null;
  pieces: string[];
  /** null = hết hàng */
  price: string | null;
  /** Chỉ có khi originalPrice > price — không bao giờ "Tiết kiệm 0đ" */
  originalPrice: string | null;
  saving: string | null;
}

export const MAX_COMBO_BLOCKS = 2;
const MAX_PIECES = 3;

export function toComboBlock(combo: IComboCard): ComboBlockView {
  const { price, originalPrice } = combo;
  const discounted =
    price !== null && originalPrice !== null && originalPrice > price;
  return {
    href: `${PATH.COMBO}/${combo.slug}`,
    name: combo.name,
    image: combo.image ?? combo.pieceImages[0] ?? null,
    pieces: combo.pieceImages.slice(0, MAX_PIECES),
    price: price === null ? null : formatPrice(price),
    originalPrice: discounted ? formatPrice(originalPrice) : null,
    saving: discounted
      ? `Tiết kiệm ${formatPrice(originalPrice - price)}`
      : null,
  };
}

export function pickComboBlocks(combos: IComboCard[]): ComboBlockView[] {
  return combos.slice(0, MAX_COMBO_BLOCKS).map(toComboBlock);
}
