import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Alias "@/" của tsconfig — thiếu là mọi module import qua alias fail khi test
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    watch: null,
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    env: { TZ: "Asia/Ho_Chi_Minh" },
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
