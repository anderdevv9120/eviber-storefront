import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";
import { ReactNode } from "react";
import { PATH } from "@/constants/paths";
import { SEARCH_PARAM } from "@/constants/search";
import theme from "@active-theme";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3030";

// JSON-LD Organization + WebSite (SEO GĐ2) — chỉ field có giá trị thật;
// sameAs (social) chủ đích bỏ trống vì link social còn placeholder;
// SearchAction trỏ đúng URL kết quả search của Header (phase 5)
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "CLOTHES",
      url: SITE_URL,
      logo: `${SITE_URL}/og.png`,
    },
    {
      "@type": "WebSite",
      name: "CLOTHES",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}${PATH.COLLECTION}?${SEARCH_PARAM}={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const metadata: Metadata = {
  // Brand placeholder đồng bộ logo CLOTHES (components/icons/Logo.tsx) — đổi brand thì sửa cả hai
  metadataBase: new URL(SITE_URL),
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
    <html lang="vi" className={theme.fontClassName}>
      {/* Font body qua preflight (fontFamily.sans = var(--font-body)), nền theo token page */}
      <body className="text-sm md:text-base antialiased leading-normal bg-page text-ink">
        {children}
        <ToastContainer hideProgressBar />
        <div id="portal" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd),
          }}
        />
      </body>
    </html>
  );
}
