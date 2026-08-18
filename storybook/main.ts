import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  // Phương án B: tất cả stories nằm trong /storybook/stories
  stories: ["./stories/**/*.stories.@(tsx|mdx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
