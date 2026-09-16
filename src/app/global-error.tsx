"use client";

import { Manrope } from "next/font/google";
import "./globals.scss";
import PageError from "@/components/organisms/PageError";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Thay cả root layout khi chính layout ném lỗi → phải tự render html/body
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="vi">
      <body
        className={`${manrope.className} min-h-screen bg-white text-sm text-dark antialiased md:text-base`}
      >
        <div className="flex min-h-screen items-center justify-center">
          <PageError reset={reset} />
        </div>
      </body>
    </html>
  );
}
