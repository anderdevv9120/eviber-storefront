/**
 * Ảnh mock TỰ CHỨA cho lô 2.
 *
 * Ưu tiên ảnh có sẵn trong /public/images (được serve qua staticDirs).
 * Ngoài ra cung cấp data-URI SVG placeholder để không phụ thuộc URL ngoài
 * (figma S3 hết hạn gây 404). Dùng cho Carousel/Review/CustomerReview...
 */

// Ảnh local trong /public/images (staticDirs = ../public)
export const LOCAL_AVATAR = "/images/avatar.png";
export const LOCAL_EMPTY_BOX = "/images/empty-box.png";
export const LOCAL_CART_EMPTY = "/images/cart-empty.png";
export const LOCAL_404 = "/images/404.jpeg";

/** Sinh 1 ảnh data-URI SVG với màu + nhãn tuỳ ý (không cần mạng). */
export function svgPlaceholder(
  label: string,
  bg = "#0E7C66",
  w = 800,
  h = 600
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="48" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Bộ ảnh banner cho Carousel (mỗi ảnh 1 màu để phân biệt slide). */
export const CAROUSEL_IMAGES: string[] = [
  svgPlaceholder("Banner 1", "#0E7C66"),
  svgPlaceholder("Banner 2", "#0089ED"),
  svgPlaceholder("Banner 3", "#F9A825"),
  svgPlaceholder("Banner 4", "#FC2B2B"),
];

export const SINGLE_IMAGE: string[] = [svgPlaceholder("Chỉ 1 ảnh", "#242424")];

/** Ảnh nhỏ cho review (ảnh đính kèm trong comment). */
export const REVIEW_IMG_1 = svgPlaceholder("Ảnh SP", "#15803D", 300, 300);
export const REVIEW_IMG_2 = svgPlaceholder("Ảnh SP 2", "#0089ED", 300, 300);
