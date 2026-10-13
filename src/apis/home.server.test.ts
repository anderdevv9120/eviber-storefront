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

describe("fetchStoreSettingsCached brand story", () => {
  const story = {
    title: "Câu chuyện của chúng tôi",
    body: "Dòng 1\nDòng 2",
    image: "/images/story.jpg",
    ctaLabel: "Tìm hiểu",
    href: "/collection",
  };

  it("falls back to no brand story when settings fail to load", async () => {
    vi.mocked(getStoreSettings).mockRejectedValueOnce(
      new Error("ECONNREFUSED")
    );
    const settings = await fetchStoreSettingsCached();
    expect(settings.brandStory).toBeNull();
  });

  it("passes the API brand story through", async () => {
    vi.mocked(getStoreSettings).mockResolvedValueOnce({
      data: { ...STORE_SETTINGS_FALLBACK, brandStory: story },
    } as never);
    const settings = await fetchStoreSettingsCached();
    expect(settings.brandStory).toEqual(story);
  });

  it("reads a missing brand story as none", async () => {
    const { brandStory: _omit, ...older } = {
      ...STORE_SETTINGS_FALLBACK,
      brandStory: story,
    };
    vi.mocked(getStoreSettings).mockResolvedValueOnce({ data: older } as never);
    const settings = await fetchStoreSettingsCached();
    expect(settings.brandStory).toBeNull();
  });
});
