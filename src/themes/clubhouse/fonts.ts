import { Fraunces, Manrope } from "next/font/google";

// Subset "vietnamese" bắt buộc — thiếu là dấu tiếng Việt render font fallback.
export const bodyFont = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body",
});

// Chỉ 400 (mọi tiêu đề display đều 400). Lưu ý: weight ["400","500"] + italic làm Turbopack
// (Next 16.3.8) fail build "next/font/google queries have exactly one entry"
export const displayFont = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
