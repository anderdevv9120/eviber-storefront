import { ICartItem } from "@/@types/Cart.type";
import type { ICartComboLine } from "@/@types/Combo.type";

// BE isAvailable gộp 3 lý do (variant tắt, hết kho, product không còn PUBLISH) — còn kho mà
// không mua được nghĩa là ngừng bán. Ngừng bán + hết kho vẫn báo "Tạm hết hàng" (BE chưa tách)
export const unavailableReason = (
  item: Pick<ICartItem, "availableQuantity">
): string => (item.availableQuantity > 0 ? "Ngừng bán" : "Tạm hết hàng");

export const comboUnavailableReason = (
  line: Pick<ICartComboLine, "isAvailable" | "unavailableReason">
): string | null => {
  if (line.isAvailable) return null;
  switch (line.unavailableReason) {
    case "COMBO_CHANGED":
      return "Combo đã thay đổi, vui lòng thêm lại";
    case "COMBO_UNAVAILABLE":
      return "Combo tạm ngừng bán";
    case "OUT_OF_STOCK":
      return "Hết hàng";
    default:
      return "Combo tạm ngừng bán";
  }
};
