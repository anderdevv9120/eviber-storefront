import { Nunito_Sans } from "next/font/google";

// Subset "vietnamese" bắt buộc — thiếu là dấu tiếng Việt render font fallback.
// Dùng 400/600/800 (display 800: --font-display: var(--font-body) trong tokens.css).
// Không truyền weight: Nunito Sans là variable font → 1 file trục wght cho cả 3 nấc. Truyền
// weight ["400","600","800"] làm Turbopack (Next 16.3.8) fail build "next/font/google queries
// have exactly one entry"
export const bodyFont = Nunito_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-body",
});
