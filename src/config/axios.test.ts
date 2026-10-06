import axios, { AxiosError, AxiosHeaders, type AxiosAdapter } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import axiosRequest, { ApiError } from "./axios";

const { clearProfile, errorToast } = vi.hoisted(() => ({
  clearProfile: vi.fn(),
  errorToast: vi.fn(),
}));
vi.mock("@/utils/cookies", () => ({ getCookie: () => undefined }));
vi.mock("@/store/useAppStore", () => ({
  useAppStore: { getState: () => ({ clearProfile }) },
}));
vi.mock("@/utils/toast", () => ({ errorToast }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("API error normalization", () => {
  it.each([
    [403, "GUEST_CHECKOUT_DISABLED"],
    [503, "CHECKOUT_SETTINGS_UNAVAILABLE"],
    [400, undefined],
    [400, null],
    [400, 42],
    [400, { code: "GUEST_CHECKOUT_DISABLED" }],
  ])("preserves only string policy codes (%s, %s)", async (status, code) => {
    vi.stubGlobal("window", {});
    const refresh = vi.spyOn(axios, "post");
    const messages = ["Backend message", "Second validation error"];
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, {
        status,
        statusText: "Error",
        headers: new AxiosHeaders(),
        config,
        data: { message: messages, errors: { code } },
      });
    };

    const error = await axiosRequest
      .get("/orders", { adapter, toastError: false })
      .catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status,
      messages,
      message: "Backend message",
      code: typeof code === "string" ? code : undefined,
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(clearProfile).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it("retains status/message when the error envelope is missing", async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, {
        status: 500,
        statusText: "Error",
        headers: new AxiosHeaders(),
        config,
        data: { message: "Try again" },
      });
    };
    await expect(
      axiosRequest.get("/orders", { adapter, toastError: false })
    ).rejects.toMatchObject({
      status: 500,
      message: "Try again",
      code: undefined,
    });
  });

  it("keeps network errors distinct from policy errors", async () => {
    const adapter: AxiosAdapter = async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    };
    await expect(
      axiosRequest.get("/orders", { adapter, toastError: false })
    ).rejects.toMatchObject({
      message: "Không thể kết nối đến máy chủ, vui lòng thử lại",
      status: undefined,
      code: undefined,
    });
  });
});
