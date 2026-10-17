// NEXT_PUBLIC_* được inline lúc build/dev start — đổi env phải rebuild/restart.
// `||` (không phải `??`) để biến rỗng cũng rơi về mặc định.
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "CLOTHES",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ||
    "Thời trang tối giản, mặc bền nhiều mùa",
  description:
    process.env.NEXT_PUBLIC_BRAND_DESCRIPTION ||
    "Khám phá bộ sưu tập mới và ưu đãi dành riêng cho thành viên tại CLOTHES — thời trang tối giản, phom chuẩn, giá minh bạch.",
};
