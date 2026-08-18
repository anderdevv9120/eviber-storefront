/**
 * Contract cart — đối chiếu: x-ecommerce-backend/src/modules/cart/cart.interface.ts
 * và cart-product.dto.ts. Cart thao tác theo VARIANT (không phải product).
 */

/** Attribute value của variant trong cart item (BE: AttributeValue trong cart.interface.ts) */
export interface ICartAttributeValue {
  name: string;
  code: string;
  value: string;
  meta?: string;
}

/** BE: CartItemResponse — isAvailable/availableQuantity do BE tính theo tồn kho hiện tại */
export interface ICartItem {
  variantId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  quantity: number;
  isAvailable: boolean;
  availableQuantity: number;
  attributeValues: ICartAttributeValue[];
}

/**
 * BE: CartResponse — LƯU Ý: chưa có cartId (BE sẽ bổ sung ở task cart-variant-guest,
 * cần cho checkout). Để optional sẵn.
 */
export interface ICartResponse {
  cartId?: string;
  items: ICartItem[];
  totalQuantity: number;
  totalOriginalPrice: number;
  totalPrice: number;
  totalSavings: number;
}

/** Payload add-to-cart / update-quantity — BE: CartProductDto (PUT update-quantity dùng cùng shape) */
export interface ICartProductPayload {
  variantId: string;
  quantity: number;
}

/** Payload remove-from-cart — BE chỉ cần variantId */
export interface ICartRemovePayload {
  variantId: string;
}
