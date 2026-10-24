import { afterEach, describe, expect, it } from "vitest";
import type { AxiosRequestConfig } from "axios";
import axiosRequest from "@/config/axios";
import { getRefundPolicy } from "./refund";

const adapter = axiosRequest.defaults.adapter;
afterEach(() => {
  axiosRequest.defaults.adapter = adapter;
});
const capture = (receive: (config: AxiosRequestConfig) => void) => {
  axiosRequest.defaults.adapter = async (config) => {
    receive(config);
    return {
      data: { data: { enabled: true, windowDays: 7, revision: 2 } },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
};

describe("refund policy transport", () => {
  it("reads the public /refund-policy route silently and forwards the abort signal", async () => {
    const controller = new AbortController();
    let request: AxiosRequestConfig | undefined;
    capture((config) => {
      request = config;
    });
    const response = await getRefundPolicy(controller.signal);
    expect(request?.method).toBe("get");
    expect(request?.url).toBe("/refund-policy");
    expect(request?.signal).toBe(controller.signal);
    expect(request?.toastError).toBe(false);
    expect(response.data).toEqual({
      enabled: true,
      windowDays: 7,
      revision: 2,
    });
  });

  it("preserves cancellation instead of turning it into a policy", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(getRefundPolicy(controller.signal)).rejects.toThrow(
      "canceled"
    );
  });
});
