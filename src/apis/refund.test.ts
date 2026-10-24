import { afterEach, describe, expect, it } from "vitest";
import type { AxiosRequestConfig } from "axios";
import axiosRequest from "@/config/axios";
import {
  getOrderRefunds,
  getRefundEvidence,
  getRefundPolicy,
  requestRefundAccess,
  submitRefund,
  uploadRefundEvidence,
  verifyRefundAccess,
} from "./refund";

const adapter = axiosRequest.defaults.adapter;
afterEach(() => {
  axiosRequest.defaults.adapter = adapter;
});
const capture = (
  receive: (config: AxiosRequestConfig) => void,
  body: unknown = { data: { enabled: true, windowDays: 7, revision: 2 } }
) => {
  axiosRequest.defaults.adapter = async (config) => {
    receive(config);
    return {
      data: body,
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

describe("customer refund transport", () => {
  const view = { data: { orderNumber: "ORD/1", allocations: [] } };
  const header = (config: AxiosRequestConfig | undefined, name: string) =>
    (config?.headers as { get(name: string): unknown } | undefined)?.get(name);

  it("reads the refund view with the registered session and no guest header", async () => {
    let request: AxiosRequestConfig | undefined;
    capture((config) => (request = config), view);
    const controller = new AbortController();
    const response = await getOrderRefunds("ORD/1", {
      signal: controller.signal,
    });
    expect(request?.method).toBe("get");
    expect(request?.url).toBe("/orders/ORD%2F1/refunds");
    expect(request?.signal).toBe(controller.signal);
    expect(request?.toastError).toBe(false);
    expect(request?.params).toBeUndefined();
    expect(header(request, "X-Refund-Token")).toBeUndefined();
    expect(response).toEqual(view);
  });

  it("sends the guest session only in X-Refund-Token, never in the URL", async () => {
    let request: AxiosRequestConfig | undefined;
    capture((config) => (request = config), view);
    await getOrderRefunds("ORD-1", { sessionToken: "guest-secret" });
    expect(header(request, "X-Refund-Token")).toBe("guest-secret");
    expect(request?.url).toBe("/orders/ORD-1/refunds");
    expect(JSON.stringify(request?.params ?? null)).not.toContain(
      "guest-secret"
    );
  });

  it("posts the submission with its idempotency key and inline errors", async () => {
    let request: AxiosRequestConfig | undefined;
    capture((config) => (request = config), view);
    const input = {
      idempotencyKey: "6b8e7f0e-3d0e-4f4b-9a56-0d6c9d5b1a11",
      items: [
        {
          allocationId: "a-0",
          quantity: 1,
          reason: "missing_item" as const,
          explanation: "Thiếu 1 sản phẩm",
          requestedReturn: "no_return" as const,
          evidenceIds: ["e1"],
        },
      ],
    };
    await submitRefund("ORD-1", input, { sessionToken: "guest-secret" });
    expect(request?.method).toBe("post");
    expect(request?.url).toBe("/orders/ORD-1/refunds");
    expect(JSON.parse(request?.data as string)).toEqual(input);
    expect(request?.toastError).toBe(false);
    expect(header(request, "X-Refund-Token")).toBe("guest-secret");
  });

  it("uploads evidence as multipart field image without forcing a content type", async () => {
    let request: AxiosRequestConfig | undefined;
    const uploaded = {
      data: { evidenceId: "e1", name: "a.png", mimeType: "image/png", size: 1 },
    };
    capture((config) => (request = config), uploaded);
    const file = new File([new Uint8Array([1])], "a.png", {
      type: "image/png",
    });
    const controller = new AbortController();
    const response = await uploadRefundEvidence("ORD-1", file, {
      signal: controller.signal,
      sessionToken: "guest-secret",
    });
    expect(request?.method).toBe("post");
    expect(request?.url).toBe("/orders/ORD-1/refund-evidence");
    expect(request?.data).toBeInstanceOf(FormData);
    expect((request?.data as FormData).get("image")).toBe(file);
    expect(String(header(request, "Content-Type") ?? "")).not.toContain(
      "multipart/form-data"
    );
    expect(request?.toastError).toBe(false);
    expect(request?.signal).toBe(controller.signal);
    expect(header(request, "X-Refund-Token")).toBe("guest-secret");
    expect(response).toEqual(uploaded);
  });

  it("reads evidence bytes as a blob through the authorized route", async () => {
    let request: AxiosRequestConfig | undefined;
    const bytes = new Blob([new Uint8Array([1])], { type: "image/png" });
    capture((config) => (request = config), bytes);
    const result = await getRefundEvidence("ORD-1", "e/1", {
      sessionToken: "guest-secret",
    });
    expect(request?.method).toBe("get");
    expect(request?.url).toBe("/orders/ORD-1/refund-evidence/e%2F1");
    expect(request?.responseType).toBe("blob");
    expect(request?.toastError).toBe(false);
    expect(header(request, "X-Refund-Token")).toBe("guest-secret");
    expect(result).toBe(bytes);
  });
});

describe("guest access transport", () => {
  const header = (config: AxiosRequestConfig | undefined, name: string) =>
    (config?.headers as { get(name: string): unknown } | undefined)?.get(name);

  it("requests an email link with no body, no credential and silent errors", async () => {
    let request: AxiosRequestConfig | undefined;
    const accepted = {
      data: { message: "Nếu đơn đủ điều kiện, email đã được gửi" },
    };
    capture((config) => (request = config), accepted);
    const response = await requestRefundAccess("ORD/1");
    expect(request?.method).toBe("post");
    expect(request?.url).toBe("/orders/ORD%2F1/refund-access/request");
    expect(request?.data).toBeUndefined();
    expect(request?.toastError).toBe(false);
    expect(header(request, "X-Refund-Token")).toBeUndefined();
    expect(response).toEqual(accepted);
  });

  it("exchanges the link token in the body only, never the URL or a header", async () => {
    let request: AxiosRequestConfig | undefined;
    const session = {
      data: {
        sessionToken: "session-secret",
        expiresAt: "2026-10-25T10:00:00.000Z",
      },
    };
    capture((config) => (request = config), session);
    const response = await verifyRefundAccess("ORD-1", "link-secret");
    expect(request?.method).toBe("post");
    expect(request?.url).toBe("/orders/ORD-1/refund-access/verify");
    expect(JSON.parse(request?.data as string)).toEqual({
      token: "link-secret",
    });
    expect(request?.toastError).toBe(false);
    expect(header(request, "X-Refund-Token")).toBeUndefined();
    expect(JSON.stringify(request?.params ?? null)).not.toContain(
      "link-secret"
    );
    expect(request?.url).not.toContain("link-secret");
    expect(response).toEqual(session);
  });

  it("keeps the session token out of every evidence and view URL", async () => {
    const urls: string[] = [];
    capture((config) => urls.push(String(config.url)), {});
    const options = { sessionToken: "session-secret" };
    await getOrderRefunds("ORD-1", options);
    await getRefundEvidence("ORD-1", "e1", options);
    await uploadRefundEvidence(
      "ORD-1",
      new File([new Uint8Array([1])], "a.png"),
      options
    );
    expect(urls).toHaveLength(3);
    for (const url of urls) expect(url).not.toContain("session-secret");
  });
});
