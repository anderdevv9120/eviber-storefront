/** @type {import('next-sitemap').IConfig} */

// Trang chặn crawl qua robots.txt: vùng private sau đăng nhập.
const robotsDisallow = [
  "/user/my-account",
  "/user/my-address",
  "/user/orders",
  "/user/notification",
  "/user/voucher",
];

// Trang mang meta noindex — KHÔNG đưa vào robots Disallow
// (bot phải crawl được mới thấy noindex), chỉ loại khỏi sitemap.
const noindexPages = [
  "/cart",
  "/checkout",
  "/payment-success",
  "/forget-password",
  "/new-password",
  "/verify-email",
  "/google-callback",
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3030";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  generateIndexSitemap: false,

  // /login và /register indexable, nằm trong sitemap
  exclude: [...robotsDisallow, ...noindexPages],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: robotsDisallow,
      },
    ],
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },
};
