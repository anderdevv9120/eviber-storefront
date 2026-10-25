import { defineConfig } from "@playwright/test";

// Isolated refund acceptance: the global setup owns a temporary MongoMemoryReplSet and fresh
// backend/admin/storefront processes (ports 3109/8111/3130), so there are no reusable web
// servers here and no live-data fixture setup. testMatch names the specs this config may run.
export default defineConfig({
  testDir: "./e2e",
  testMatch: [
    "refunds.spec.ts",
    "guest-checkout.spec.ts",
    "user-checkout.spec.ts",
    "buy-now.spec.ts",
    "bank-transfer.spec.ts",
  ],
  globalSetup: "./e2e/setup/refunds-global-setup.ts",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3130",
    channel: process.env.E2E_BROWSER_CHANNEL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
