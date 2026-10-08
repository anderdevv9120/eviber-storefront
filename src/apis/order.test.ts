import { afterEach, describe, expect, it } from "vitest";
import type { AxiosRequestConfig } from "axios";
import axiosRequest from "@/config/axios";
import { checkoutReview, makeOrder } from "./order";
import type { IMakeOrderPayload } from "@/@types/Order.type";

const adapter = axiosRequest.defaults.adapter;
afterEach(() => {
  axiosRequest.defaults.adapter = adapter;
});
const capture = (receive: (config: AxiosRequestConfig) => void) => {
  axiosRequest.defaults.adapter = async (config) => {
    receive(config);
    return {
      data: { data: { totalPrice: 0 } },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
};

describe("voucher order transport", () => {
  it("forwards the code without changing signal/toast argument order", async () => {
    const controller = new AbortController();
    let request: AxiosRequestConfig | undefined;
    capture((config) => {
      request = config;
    });
    await checkoutReview("cart-a", controller.signal, {
      couponCode: "SAVE10",
      toastError: false,
    });
    expect(request?.url).toBe("/orders/checkout-review/cart-a");
    expect(request?.params).toEqual({ couponCode: "SAVE10" });
    expect(request?.signal).toBe(controller.signal);
    expect(request?.toastError).toBe(false);
  });
  it("preserves cancellation and does not turn it into a review", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      checkoutReview("cart-a", controller.signal, { toastError: false })
    ).rejects.toThrow("canceled");
  });
  it("sends accepted total/item scope exactly, omitting free-order paymentInfo", async () => {
    let body: unknown;
    capture((config) => {
      body = JSON.parse(config.data);
    });
    const payload: IMakeOrderPayload = {
      cartId: "cart-a",
      couponCode: "FREE",
      expectedTotalPrice: 0,
      expectedCartItems: [{ variantId: "variant-a", quantity: 2 }],
      shippingInfo: {
        name: "Nguyen A",
        phoneNumber: "0912345678",
        email: "a@example.com",
        city: "City",
        ward: "Ward",
        specificAddress: "12 Street",
      },
    };
    await makeOrder(payload, { toastError: false });
    expect(body).toEqual(payload);
    expect(body).not.toHaveProperty("paymentInfo");
  });
});
