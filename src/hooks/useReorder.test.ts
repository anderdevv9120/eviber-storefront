import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IOrderCombo } from "@/@types/Combo.type";
import type { IOrderProduct } from "@/@types/Order.type";
import { addComboToCart, addToCart } from "@/apis/cart";
import { ApiError } from "@/config/axios";
import { PATH } from "@/constants/paths";
import { errorToast, successToast, warningToast } from "@/utils/toast";
import { useReorder } from "./useReorder";

const { fetchCart, push } = vi.hoisted(() => ({
  fetchCart: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/apis/cart", () => ({
  addComboToCart: vi.fn(),
  addToCart: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/store/useCartStore", () => ({
  useCartStore: (
    selector: (state: { fetchCart: typeof fetchCart }) => unknown
  ) => selector({ fetchCart }),
}));
vi.mock("@/utils/toast", () => ({
  errorToast: vi.fn(),
  successToast: vi.fn(),
  warningToast: vi.fn(),
}));

const combo: IOrderCombo = {
  comboGroupId: "g1",
  comboId: "outfit",
  nameAtOrder: "Áo và quần",
  quantity: 2,
  pricingModeAtOrder: "FIXED",
  pricingValueAtOrder: 250,
  totalAtOrder: 500,
};
const piece: IOrderProduct = {
  comboGroupId: "g1",
  productId: "shirt",
  variantId: "shirt-m",
  productNameAtOrder: "Áo",
  quantity: 2,
  priceAtOrder: 83,
  originalPriceAtOrder: 200,
};
const products = [
  piece,
  { ...piece, quantity: 2, priceAtOrder: 84 },
  { ...piece, productId: "jeans", variantId: "jeans-xl", quantity: 2 },
];

function renderReorder() {
  let reorder!: ReturnType<typeof useReorder>["reorder"];
  function Probe({
    capture,
  }: {
    capture: (value: ReturnType<typeof useReorder>["reorder"]) => void;
  }) {
    capture(useReorder().reorder);
    return null;
  }
  renderToStaticMarkup(
    createElement(Probe, {
      capture: (value) => {
        reorder = value;
      },
    })
  );
  return reorder;
}

describe("useReorder", () => {
  beforeEach(() => vi.resetAllMocks());

  it("adds one combo with unique picks, then refreshes the cart and navigates", async () => {
    await renderReorder()("order", products, [combo]);
    expect(addComboToCart).toHaveBeenCalledExactlyOnceWith(
      {
        comboId: "outfit",
        quantity: 2,
        picks: [
          { productId: "shirt", variantId: "shirt-m" },
          { productId: "jeans", variantId: "jeans-xl" },
        ],
      },
      { silent: true }
    );
    expect(addToCart).not.toHaveBeenCalled();
    expect(fetchCart).toHaveBeenCalledExactlyOnceWith(true);
    expect(push).toHaveBeenCalledExactlyOnceWith(PATH.CART);
    expect(successToast).toHaveBeenCalledOnce();
  });

  it.each([400, 404])(
    "falls back on %i without multiplying piece quantities again",
    async (status) => {
      vi.mocked(addComboToCart).mockRejectedValueOnce(
        new ApiError("Unavailable", status)
      );
      await renderReorder()("order", products, [combo]);
      expect(addToCart).toHaveBeenCalledTimes(2);
      expect(addToCart).toHaveBeenNthCalledWith(
        1,
        { variantId: "shirt-m", quantity: 4 },
        { silent: true }
      );
      expect(addToCart).toHaveBeenNthCalledWith(
        2,
        { variantId: "jeans-xl", quantity: 2 },
        { silent: true }
      );
      expect(successToast).toHaveBeenCalledOnce();
      expect(warningToast).not.toHaveBeenCalled();
    }
  );

  it.each([401, 403, 409, 500, undefined])(
    "stops on combo infrastructure/session failure %s without fallback",
    async (status) => {
      vi.mocked(addComboToCart).mockRejectedValueOnce(
        status ? new ApiError("Failed", status) : new Error("Network failed")
      );
      await renderReorder()("order", products, [combo]);
      expect(addToCart).not.toHaveBeenCalled();
      expect(errorToast).toHaveBeenCalledOnce();
      expect(fetchCart).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    }
  );

  it("skips an unavailable fallback piece and continues with other pieces and normal products", async () => {
    vi.mocked(addComboToCart).mockRejectedValueOnce(
      new ApiError("Missing", 404)
    );
    vi.mocked(addToCart).mockRejectedValueOnce(new ApiError("No stock", 400));
    await renderReorder()(
      "order",
      [
        ...products,
        { ...piece, comboGroupId: undefined, variantId: "normal", quantity: 1 },
      ],
      [combo]
    );
    expect(addToCart).toHaveBeenCalledTimes(3);
    expect(warningToast).toHaveBeenCalledWith(expect.stringContaining("Áo"));
    expect(push).toHaveBeenCalledWith(PATH.CART);
  });

  it("reports when all fallback pieces fail without navigating to the cart", async () => {
    vi.mocked(addComboToCart).mockRejectedValueOnce(
      new ApiError("Missing", 404)
    );
    vi.mocked(addToCart).mockRejectedValue(new ApiError("No stock", 400));
    await renderReorder()("order", products, [combo]);
    expect(errorToast).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
    expect(fetchCart).not.toHaveBeenCalled();
  });

  it("retains normal-product reorder for legacy orders", async () => {
    await renderReorder()("old", [{ ...piece, comboGroupId: undefined }]);
    expect(addComboToCart).not.toHaveBeenCalled();
    expect(addToCart).toHaveBeenCalledExactlyOnceWith(
      { variantId: "shirt-m", quantity: 2 },
      { silent: true }
    );
    expect(push).toHaveBeenCalledWith(PATH.CART);
  });
});
