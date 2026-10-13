import fs from "node:fs";
import path from "node:path";

// Theme chọn lúc build (1 deploy / 1 khách) — tên thư mục trong src/themes.
// Đổi THEME phải restart next dev.
const THEME = process.env.THEME ?? "rosier";
const THEMES_DIR = path.join(import.meta.dirname, "src/themes");
if (!fs.existsSync(path.join(THEMES_DIR, THEME, "index.ts"))) {
  const valid = fs
    .readdirSync(THEMES_DIR)
    .filter((name) => fs.existsSync(path.join(THEMES_DIR, name, "index.ts")));
  throw new Error(`Unknown THEME "${THEME}". Valid: ${valid.join(", ")}`);
}

// Dev: ảnh upload phục vụ từ backend http://localhost — Next 16 chặn http và IP nội bộ mặc định.
// Production giữ nguyên (API chạy https, đã khớp pattern "**").
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: { "@active-theme": `./src/themes/${THEME}` },
  },
  async headers() {
    if (process.env.NEXT_ENV === process.env.NEXT_ENV_PROD) {
      return [
        {
          source: "/:all*(svg|jpg|png|gif|js|webp)",
          locale: false,
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=86400, must-revalidate",
            },
          ],
        },
      ];
    }
    return [];
  },
  images: {
    qualities: [75, 100],
    dangerouslyAllowLocalIP: !isProd,
    remotePatterns: [
      ...(isProd ? [] : [{ protocol: "http", hostname: "localhost" }]),
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
