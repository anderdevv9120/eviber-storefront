import { PATH } from "@/constants/paths";

// Chưa có trang danh sách combo (chỉ /combo/[slug]) — neo xuống khối combo ở home (ComboSplit id="combo")
export const COMBO_ANCHOR = `${PATH.HOME}#combo`;
// "Liên hệ" chưa có trang riêng — neo xuống khối liên hệ ở Footer (id="lien-he")
export const CONTACT_ANCHOR = `${PATH.HOME}#lien-he`;
// Slug "doi-tra" có trong POLICY_SLUGS (constants/storeContent) — trang /chinh-sach/[slug]
export const RETURN_POLICY_HREF = `${PATH.POLICY}/doi-tra`;

// Thứ tự nav mockup son-lua: Sản phẩm · Bộ sưu tập ▾ · Combo · Chính sách đổi trả · Liên hệ
export const LINKS_BEFORE_COLLECTION = [
  { name: "Sản phẩm", href: PATH.COLLECTION },
];
export const LINKS_AFTER_COLLECTION = [
  { name: "Combo", href: COMBO_ANCHOR },
  { name: "Chính sách đổi trả", href: RETURN_POLICY_HREF },
  { name: "Liên hệ", href: CONTACT_ANCHOR },
];

// Cùng quy ước Category.tsx: thiếu slug → collection trần (không filter được)
export const categoryHref = (slug?: string) =>
  slug
    ? `${PATH.COLLECTION}?category=${encodeURIComponent(slug)}`
    : PATH.COLLECTION;

/** Mục đang xem trong "Bộ sưu tập": null = không ở /collection, "" = tất cả sản phẩm, còn lại = slug */
export const activeCollectionKey = (
  pathname: string,
  category: string | null
): string | null => (pathname === PATH.COLLECTION ? (category ?? "") : null);
