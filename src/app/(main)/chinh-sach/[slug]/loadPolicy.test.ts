import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPolicy } from "@/apis/storeContent";
import { ApiError } from "@/config/axios";
import { loadPolicy } from "./loadPolicy";

vi.mock("@/apis/storeContent", () => ({ getPolicy: vi.fn() }));

describe("loadPolicy", () => {
  beforeEach(() => {
    vi.mocked(getPolicy).mockReset();
  });

  it("returns the published page", async () => {
    const page = {
      slug: "doi-tra",
      title: "Đổi trả",
      contentHtml: "<p>7 ngày</p>",
      updatedAt: null,
    };
    vi.mocked(getPolicy).mockResolvedValueOnce({
      data: page,
      message: "success",
    } as never);
    await expect(loadPolicy("doi-tra")).resolves.toEqual(page);
  });

  it("returns null for an unpublished page", async () => {
    vi.mocked(getPolicy).mockRejectedValueOnce(
      new ApiError("Không tìm thấy", 404)
    );
    await expect(loadPolicy("doi-tra")).resolves.toBeNull();
  });

  it("returns null for an unknown slug without calling the backend", async () => {
    await expect(loadPolicy("khong-co")).resolves.toBeNull();
    expect(getPolicy).not.toHaveBeenCalled();
  });

  it("rethrows transient failures so ISR does not cache a false 404", async () => {
    vi.mocked(getPolicy).mockRejectedValueOnce(
      new ApiError("Lỗi máy chủ", 503)
    );
    await expect(loadPolicy("doi-tra")).rejects.toBeInstanceOf(ApiError);
  });
});
