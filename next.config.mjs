// Dev: ảnh upload phục vụ từ backend http://localhost — Next 16 chặn http và IP nội bộ mặc định.
// Production giữ nguyên (API chạy https, đã khớp pattern "**").
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
