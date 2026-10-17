import { Nunito_Sans } from "next/font/google";

// Subset "vietnamese" bắt buộc — thiếu là dấu tiếng Việt render font fallback.
// Dùng 400/600/800 (display 800: --font-display: var(--font-body) trong tokens.css).
// Không truyền weight: Nunito Sans là variable font → 1 file trục wght cho cả 3 nấc.
// Đã thử lại weight ["400", "600", "800"] (không style) trên Turbopack (Next 16.3.8): build fail
//   "Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
//    … next/font/google queries have exactly one entry"
// Một weight đơn ("800") build được — lỗi chỉ xảy ra khi có nhiều weight.
export const bodyFont = Nunito_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-body",
});
