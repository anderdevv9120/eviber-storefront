import { afterEach, describe, expect, it } from "vitest";
import type { AxiosRequestConfig } from "axios";
import axiosRequest from "@/config/axios";
import { cancelOrder, checkoutReview, getOrders, makeOrder } from "./order";
import { ORDER_TABS } from "@/constants/orderStatus";
import type { ICheckoutReview, IMakeOrderPayload } from "@/@types/Order.type";

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

describe("customer order filters", () => {
  it("requests confirmed orders when selecting Đã xác nhận", async () => {
    let request: AxiosRequestConfig | undefined;
    capture((config) => {
      request = config;
    });
    const tab = ORDER_TABS.find((tab) => tab.label === "Đã xác nhận");

    await getOrders({ status: tab?.status, page: 1, pageSize: 10 });

    expect(request?.url).toBe("/orders");
    expect(request?.params).toEqual({
      status: "confirmed",
      page: 1,
      pageSize: 10,
    });
  });
});

describe("cancel order transport", () => {
  it("sends the chosen reason to PATCH /orders/:id/cancel", async () => {
    let request: AxiosRequestConfig | undefined;
    capture((config) => {
      request = config;
    });

    await cancelOrder("order-1", { reason: "other", note: "Giao quá chậm" });

    expect(request?.url).toBe("/orders/order-1/cancel");
    expect(request?.method).toBe("patch");
    expect(JSON.parse(request?.data as string)).toEqual({
      reason: "other",
      note: "Giao quá chậm",
    });
  });

  it("omits note entirely for preset reasons", async () => {
    let request: AxiosRequestConfig | undefined;
    capture((config) => {
      request = config;
    });

    await cancelOrder("order-1", { reason: "changed_mind" });

    expect(JSON.parse(request?.data as string)).toEqual({
      reason: "changed_mind",
    });
  });
});

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
  it("sends the reviewed refund terms to POST /orders unchanged", async () => {
    let body: unknown;
    capture((config) => {
      body = JSON.parse(config.data);
    });
    const payload: IMakeOrderPayload = {
      cartId: "cart-a",
      expectedRefundTerms: {
        policyRevision: 3,
        products: [
          { productId: "64b000000000000000000001", refundEnabled: false },
        ],
      },
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
  });
  it("returns the review's refund terms and per-line product flags as served", async () => {
    const review: ICheckoutReview = {
      refundTerms: {
        policyRevision: 3,
        products: [
          { productId: "64b000000000000000000001", refundEnabled: false },
        ],
      },
      subtotal: 100000,
      shippingFee: 0,
      discountAmount: 0,
      totalPrice: 100000,
      products: [
        {
          refundEnabled: false,
          price: 100000,
          originalPrice: 100000,
          quantity: 1,
          productId: "64b000000000000000000001",
          variantId: "variant-a",
          name: "Shirt",
          slug: "shirt",
          images: [],
          inventoryCount: 3,
          discountPercentage: 0,
          sku: "SKU-A",
          variantImage: "",
        },
      ],
      combos: [],
    };
    axiosRequest.defaults.adapter = async (config) => ({
      data: { data: review },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
    const response = await checkoutReview("cart-a");
    expect(response.data).toEqual(review);
    expect(response.data.refundTerms.products[0].refundEnabled).toBe(false);
    expect(response.data.products[0].refundEnabled).toBe(false);
  });
});
