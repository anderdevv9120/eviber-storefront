import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";
import { ReactNode } from "react";

// Subset "vietnamese" bắt buộc — thiếu là dấu tiếng Việt render font fallback
const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  // Brand placeholder đồng bộ logo CLOTHES (components/icons/Logo.tsx) — đổi brand thì sửa cả hai
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3030"
  ),
  title: {
    default: "CLOTHES",
    template: "%s | CLOTHES",
  },
  description:
    "Mua sắm trực tuyến — bộ sưu tập mới và ưu đãi dành riêng cho gen Z.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body
        className={`${manrope.className} text-sm md:text-base antialiased leading-normal bg-white text-gray-900`}
      >
        {children}
        <ToastContainer hideProgressBar />
        <div id="portal" />
      </body>
    </html>
  );
}
