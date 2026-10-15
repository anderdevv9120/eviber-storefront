import React from "react";
import type { Preview, Decorator } from "@storybook/nextjs-vite";
import theme from "@active-theme";

// CSS toàn cục của dự án (Tailwind + SCSS) + toastify
import "../src/app/globals.scss";
import "react-toastify/dist/ReactToastify.css";

/**
 * Global decorator: đảm bảo luôn có phần tử #portal trong DOM.
 * Portal.tsx render vào document.getElementById("portal"); nếu thiếu,
 * Modal / các component dùng Portal sẽ ra null (không hiển thị).
 */
const withPortalRoot: Decorator = (Story) => {
  React.useEffect(() => {
    if (!document.getElementById("portal")) {
      const el = document.createElement("div");
      el.id = "portal";
      document.body.appendChild(el);
    }
  }, []);

  return <Story />;
};

/**
 * Global decorator: gắn class font của theme active lên <html> như app/layout.tsx
 * (tokens.css đã nạp qua import theme; --font-display đọc --font-body tại :root).
 */
const withThemeFont: Decorator = (Story) => {
  React.useEffect(() => {
    document.documentElement.classList.add(...theme.fontClassName.split(" "));
  }, []);

  return <Story />;
};

const preview: Preview = {
  decorators: [withPortalRoot, withThemeFont],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' hiển thị vi phạm a11y trong tab test, không fail CI
      test: "todo",
    },
    nextjs: {
      // Bật app-router mock (next/navigation) cho các component cần router
      appDirectory: true,
    },
  },
};

export default preview;
