import { Be_Vietnam_Pro } from "next/font/google";

// Subset "vietnamese" bắt buộc — thiếu là dấu tiếng Việt render font fallback.
// 800 cho tiêu đề display (--font-display: var(--font-body) trong tokens.css)
export const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body",
});
