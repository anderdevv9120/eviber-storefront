import React from "react";
import type { Preview, Decorator } from "@storybook/nextjs-vite";

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

const preview: Preview = {
  decorators: [withPortalRoot],
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
