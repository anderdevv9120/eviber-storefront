import { cache } from "react";
import { getCategory } from "./home";
import { ICategoryItem } from "@/@types/Home.type";
import { getStoreSettings } from "./storeContent";
import { IStoreSettings } from "@/@types/StoreContent.type";
import { STORE_SETTINGS_FALLBACK } from "@/constants/storeContent";

/**
 * Server-only: dedupe /categories theo request (React cache) — nav Header ((main)/layout)
 * và section Danh mục (Category) cùng render 1 lượt chỉ tốn 1 call BE.
 * Lỗi/rỗng → [] để caller tự ẩn UI (chốt GĐ2).
 */
export const fetchCategoriesCached = cache(
  async (): Promise<ICategoryItem[]> => {
    try {
      const response = await getCategory();
      return response?.data?.data || [];
    } catch {
      return [];
    }
  }
);

/**
 * Server-only: dedupe /store-settings theo request — (main)/layout (Footer), home và
 * product page cùng render 1 lượt chỉ tốn 1 call BE. Lỗi → bản hardcode cũ, ẩn link chính sách.
 */
export const fetchStoreSettingsCached = cache(
  async (): Promise<IStoreSettings> => {
    try {
      const response = await getStoreSettings();
      if (!response?.data) return STORE_SETTINGS_FALLBACK;
      // BE cũ chưa có field → coi như không có câu chuyện / chưa có chính sách xuất bản
      return {
        ...response.data,
        brandStory: response.data.brandStory ?? null,
        publishedPolicies: response.data.publishedPolicies ?? [],
      };
    } catch {
      return STORE_SETTINGS_FALLBACK;
    }
  }
);
