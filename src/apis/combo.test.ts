import { afterEach, describe, expect, it } from "vitest";
import type { AxiosRequestConfig } from "axios";
import axiosRequest from "@/config/axios";
import { getComboBySlug, getCombos } from "./combo";
import cartAPI, {
  addComboToCart,
  removeComboFromCart,
  updateComboQuantity,
} from "./cart";

const adapter = axiosRequest.defaults.adapter;
afterEach(() => {
  axiosRequest.defaults.adapter = adapter;
});
const capture = () => {
  const requests: AxiosRequestConfig[] = [];
  axiosRequest.defaults.adapter = async (config) => {
    requests.push(config);
    return {
      data: { data: { combos: [] } },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  return requests;
};

describe("storefront combo transport", () => {
  it("forwards category pagination and uses the backend slug route", async () => {
    const requests = capture();
    const params = { category: "outfits", page: 2, pageSize: 8 };
    await getCombos(params);
    await getComboBySlug("summer-outfit");
    expect(requests[0]).toMatchObject({
      method: "get",
      url: "/combos",
      params,
    });
    expect(requests[1]).toMatchObject({
      method: "get",
      url: "/combos/by-slug/summer-outfit",
    });
  });

  it("adds delta quantities and preserves normal/silent toast behavior", async () => {
    const requests = capture();
    const payload = {
      comboId: "outfit",
      quantity: 2,
      picks: [{ productId: "shirt", variantId: "shirt-m" }],
    };
    const result = await addComboToCart(payload);
    await cartAPI.addComboToCart(payload, { silent: true });
    expect(result.data).toEqual({ combos: [] });
    expect(requests[0]).toMatchObject({
      method: "post",
      url: "/carts/combos",
      toastError: true,
    });
    expect(requests[1].toastError).toBe(false);
    expect(JSON.parse(requests[0].data)).toEqual(payload);
  });

  it("updates absolute quantity and removes by lineId in the DELETE body", async () => {
    const requests = capture();
    await updateComboQuantity({ lineId: "line", quantity: 3 });
    await removeComboFromCart({ lineId: "line" });
    expect(requests[0]).toMatchObject({
      method: "put",
      url: "/carts/combos/quantity",
    });
    expect(JSON.parse(requests[0].data)).toEqual({
      lineId: "line",
      quantity: 3,
    });
    expect(requests[1]).toMatchObject({
      method: "delete",
      url: "/carts/combos",
    });
    expect(JSON.parse(requests[1].data)).toEqual({ lineId: "line" });
    expect(cartAPI.updateComboQuantity).toBe(updateComboQuantity);
    expect(cartAPI.removeComboFromCart).toBe(removeComboFromCart);
  });
});
