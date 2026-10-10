import { ICartItem } from "@/@types/Cart.type";

// BE isAvailable gộp 3 lý do (variant tắt, hết kho, product không còn PUBLISH) — còn kho mà
// không mua được nghĩa là ngừng bán. Ngừng bán + hết kho vẫn báo "Tạm hết hàng" (BE chưa tách)
export const unavailableReason = (
  item: Pick<ICartItem, "availableQuantity">
): string => (item.availableQuantity > 0 ? "Ngừng bán" : "Tạm hết hàng");
