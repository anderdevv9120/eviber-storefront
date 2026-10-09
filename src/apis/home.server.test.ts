import { describe, expect, it, vi } from "vitest";
import { getStoreSettings } from "./storeContent";
import { fetchStoreSettingsCached } from "./home.server";
import { STORE_SETTINGS_FALLBACK } from "@/constants/storeContent";

vi.mock("./storeContent", () => ({ getStoreSettings: vi.fn() }));
vi.mock("./home", () => ({ getCategory: vi.fn() }));

describe("fetchStoreSettingsCached", () => {
  it("falls back to the hardcoded copy with no policy links when the backend fails", async () => {
    vi.mocked(getStoreSettings).mockRejectedValueOnce(
      new Error("ECONNREFUSED")
    );
    const settings = await fetchStoreSettingsCached();
    expect(settings).toEqual(STORE_SETTINGS_FALLBACK);
    expect(settings.publishedPolicySlugs).toEqual([]);
  });
});
