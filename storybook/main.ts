import fs from "node:fs";
import path from "node:path";
import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from "vite";

// Mirror alias @active-theme của next.config.mjs (đọc cùng env THEME)
const THEME = process.env.THEME ?? "rosier";
const THEMES_DIR = path.join(import.meta.dirname, "../src/themes");
if (!fs.existsSync(path.join(THEMES_DIR, THEME, "index.ts"))) {
  const valid = fs
    .readdirSync(THEMES_DIR)
    .filter((name) => fs.existsSync(path.join(THEMES_DIR, name, "index.ts")));
  throw new Error(`Unknown THEME "${THEME}". Valid: ${valid.join(", ")}`);
}

const config: StorybookConfig = {
  // Phương án B: tất cả stories nằm trong /storybook/stories
  stories: ["./stories/**/*.stories.@(tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@active-theme/card": path.join(THEMES_DIR, THEME, "card"),
          "@active-theme": path.join(THEMES_DIR, THEME),
        },
      },
    }),
};

export default config;
