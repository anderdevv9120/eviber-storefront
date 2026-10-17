// NEXT_PUBLIC_* được inline lúc build/dev start — đổi env phải rebuild/restart.
// `||` (không phải `??`) để biến rỗng cũng rơi về mặc định.
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "Third Shot",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ||
    "Đồ pickleball chính hãng cho mọi trình độ",
  description:
    process.env.NEXT_PUBLIC_BRAND_DESCRIPTION ||
    "Vợt, bóng, giày và trang phục pickleball chính hãng — tư vấn chọn vợt tận tình, giao nhanh toàn quốc.",
};
