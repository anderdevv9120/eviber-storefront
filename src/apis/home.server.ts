import { cache } from "react";
import { getCategory } from "./home";
import { ICategoryItem } from "@/@types/Home.type";

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
