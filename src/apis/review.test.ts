import { afterEach, describe, expect, it, vi } from "vitest";
import axiosRequest from "@/config/axios";
import { createReview, editReview, getReviewEligibility } from "./review";

vi.mock("@/config/axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
afterEach(() => vi.clearAllMocks());

describe("private review transport", () => {
  it("uses authenticated eligibility with cancellation and inline errors", async () => {
    const signal = new AbortController().signal;
    await getReviewEligibility("product", signal);
    expect(axiosRequest.get).toHaveBeenCalledWith("/reviews/eligibility", {
      params: { productId: "product" },
      signal,
      toastError: false,
    });
  });

  it("sends multipart writes without overriding the browser boundary", async () => {
    const data = new FormData();
    const signal = new AbortController().signal;
    await createReview(data, signal);
    await editReview("review/id", data, signal);
    const options = { signal, toastError: false, timeout: 180_000 };
    expect(axiosRequest.post).toHaveBeenCalledWith("/reviews", data, options);
    expect(axiosRequest.patch).toHaveBeenCalledWith(
      "/reviews/review%2Fid",
      data,
      options
    );
  });
});
