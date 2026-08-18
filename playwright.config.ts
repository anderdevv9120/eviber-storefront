import { defineConfig } from "@playwright/test";

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
      cwd: "../x-ecommerce-backend",
      url: "http://localhost:3009/api/v1/products",
      reuseExistingServer: true,
      timeout: 120_000,
      // Nâng rate limit auth chỉ trong process BE phục vụ test (xem auth.controller.ts);
      // BE tự chạy tay muốn e2e dồn dập → export biến này trước npm run start:dev
      env: { AUTH_THROTTLE_LIMIT: "100" },
    },
    {
      command: "npm run dev",
      url: "http://localhost:3030",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
