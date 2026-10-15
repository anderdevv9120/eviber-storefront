import { defineConfig } from "@playwright/test";

// BE fail-fast khi thiếu key payOS. E2e ép key giả + base URL chết (cổng discard) để BE test
// không bao giờ gọi payOS thật: route link trả 503 ngay, spec nào cần QR thì mock ở trình duyệt.
// Biến ở đây thắng .env của backend (dotenv không ghi đè biến đã có).
const PAYOS_E2E_ENV = {
  PAYOS_CLIENT_ID: "e2e-client-id",
  PAYOS_API_KEY: "e2e-api-key",
  PAYOS_CHECKSUM_KEY: "e2e-checksum-key",
  PAYOS_BASE_URL: "http://127.0.0.1:9",
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
