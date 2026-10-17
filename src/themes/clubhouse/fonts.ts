import { Fraunces, Manrope } from "next/font/google";

// Subset "vietnamese" bắt buộc — thiếu là dấu tiếng Việt render font fallback.
export const bodyFont = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

// Fraunces 400/500 qua trục wght "variable": weight ["400","500"] + italic làm Turbopack (Next 16.3.8)
// fail build "next/font/google queries have exactly one entry"; một weight tĩnh thì build được
export const displayFont = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
