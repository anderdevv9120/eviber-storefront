import { MetadataRoute } from "next";
import { PATH } from "@/constants/paths";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3030";

// Chỉ chặn crawl vùng private sau đăng nhập. Trang phễu (cart/checkout/success) và
// auth utility dùng meta noindex nên KHÔNG Disallow — bot phải crawl được mới thấy meta
const DISALLOW = [
  PATH.MY_ACCOUNT,
  PATH.MY_ADDRESS,
  PATH.ORDER,
  PATH.NOTIFICATION,
  PATH.VOUCHER,
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOW }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
