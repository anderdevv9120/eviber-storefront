import { getPolicy } from "@/apis/storeContent";
import { ApiError } from "@/config/axios";
import type { IPolicyPage } from "@/@types/StoreContent.type";
import { isPolicySlug } from "@/constants/storeContent";

// null CHỈ cho 404 thật (slug lạ / chưa xuất bản → notFound); lỗi transient phải THROW —
// trả null là ISR cache trang 404 đè bản tốt suốt chu kỳ revalidate (cùng quy ước product page)
export async function loadPolicy(slug: string): Promise<IPolicyPage | null> {
  if (!isPolicySlug(slug)) return null;
  try {
    const response = await getPolicy(slug);
    return response?.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
