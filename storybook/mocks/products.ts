import type { IProductListItem } from "@/@types/Product.type";
import type { ICartItem } from "@/@types/Cart.type";

// Ảnh mock tự chứa (Unsplash - đã whitelist trong next.config.mjs qua hostname "**")
export const MOCK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";
export const MOCK_IMAGE_2 =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop";

/**
 * IProductListItem cho CardItem (mock tự chứa, KHÔNG import fetchData.ts).
 * price = giá bán thật, originalPrice = giá gốc (contract mới — giá từ preview variant).
 */
export const mockProductDetail: IProductListItem = {
  _id: "prod-001",
  name: "Giày thể thao Running Pro X - phiên bản giới hạn",
  slug: "giay-the-thao-running-pro-x",
  image: MOCK_IMAGE,
  price: 960000,
  originalPrice: 1200000,
  discountPercentage: 20,
};

export const mockProductDetailNoDiscount: IProductListItem = {
  _id: "prod-002",
  name: "Áo thun cotton basic",
  slug: "ao-thun-cotton-basic",
  image: MOCK_IMAGE_2,
  price: 250000,
};

/**
 * Cart item cho ProductItem (contract mới ICartItem): có discount + attributes.
 * price = giá bán, originalPrice = giá gốc (BE tính sẵn, FE không tự giảm giá).
 */
export const mockCartItemWithDiscount: ICartItem = {
  variantId: "variant-001",
  name: "Giày thể thao Running Pro X - phiên bản giới hạn",
  slug: "giay-the-thao-running-pro-x",
  image: MOCK_IMAGE,
  price: 960000,
  originalPrice: 1200000,
  discountPercentage: 20,
  quantity: 2,
  isAvailable: true,
  availableQuantity: 42,
  attributeValues: [
    { name: "Kích thước", code: "size", value: "Size 42" },
    { name: "Màu sắc", code: "color", value: "Màu đen", meta: "#242424" },
  ],
};

/**
 * Cart item: KHÔNG discount, KHÔNG attributes.
 */
export const mockCartItemPlain: ICartItem = {
  variantId: "variant-002",
  name: "Áo thun cotton basic",
  slug: "ao-thun-cotton-basic",
  image: MOCK_IMAGE_2,
  price: 250000,
  originalPrice: 250000,
  discountPercentage: 0,
  quantity: 1,
  isAvailable: true,
  availableQuantity: 10,
  attributeValues: [],
};

/**
 * Cart item hết hàng — render mờ + label, không Counter.
 */
export const mockCartItemUnavailable: ICartItem = {
  ...mockCartItemWithDiscount,
  variantId: "variant-003",
  isAvailable: false,
  availableQuantity: 0,
};
