import { defineConfig } from "@playwright/test";

// Key payOS nằm ở DB (CMS › Cài đặt › Thanh toán); spec chuyển khoản tự lưu key giả khi DB chưa có
// (helpers/payment-link.ts) — BE bình thường từ chối lưu key payOS không chấp nhận, nên tắt bước kiểm
// key cho process e2e (BE bỏ qua biến này ở production). Base URL chết (cổng discard) để BE test không
// bao giờ gọi payOS thật: route link trả 503 ngay, spec nào cần QR thì mock ở trình duyệt.
// Biến ở đây thắng .env của backend.
const PAYOS_E2E_ENV = {
  PAYOS_BASE_URL: "http://127.0.0.1:9",
  PAYOS_E2E_SKIP_KEY_CHECK: "true",
};

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/setup/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Các flow cùng mutate kho/cart trên 1 DB dev thật — chạy tuần tự để deterministic
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3030",
    // Optional installed browser for local runs; default remains Playwright Chromium.
    channel: process.env.E2E_BROWSER_CHANNEL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run start:dev",
      cwd: "../backend",
      url: "http://localhost:3009/api/v1/products",
      reuseExistingServer: true,
      timeout: 120_000,
      // Nâng rate limit auth + lookup đơn chỉ trong process BE phục vụ test (share/utils/auth-throttle.ts);
      // lookup: mỗi lần mở màn chờ chuyển khoản là 2 lookup (StrictMode) + polling 5s, suite mở
      // hàng chục lần/phút nên 20/60s thật sẽ 429 ở test cuối. BE tự chạy tay muốn e2e dồn dập →
      // export 2 biến này trước npm run start:dev
      env: {
        AUTH_THROTTLE_LIMIT: "100",
        ORDER_LOOKUP_THROTTLE_LIMIT: "200",
        // Spec bank-transfer kiểm hạn đơn = 1h; ghim để .env máy dev đặt khác không làm lệch
        ORDER_PAYMENT_DUE_HOURS: "1",
        ...PAYOS_E2E_ENV,
      },
    },
    {
      // Admin entrypoint cho e2e bank-transfer (admin set paid qua API). Port 8011 vì 8001
      // trên máy dev đang bị service khác chiếm; spec đọc E2E_ADMIN_API cùng giá trị
      command: "npm run start:admin:dev",
      cwd: "../backend",
      url: "http://localhost:8011/admin-docs",
      reuseExistingServer: true,
      timeout: 120_000,
      env: { ADMIN_PORT: "8011", ...PAYOS_E2E_ENV },
    },
    {
      command: "npm run dev",
      url: "http://localhost:3030",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
