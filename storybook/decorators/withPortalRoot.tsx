import React from "react";
import type { Decorator } from "@storybook/nextjs-vite";

/**
 * Đảm bảo có phần tử <div id="portal" /> trong DOM để Portal/Modal render được.
 * Preview đã áp global, decorator này để dùng lại tường minh ở story lẻ nếu cần.
 */
export const withPortalRoot: Decorator = (Story) => {
  React.useEffect(() => {
    if (!document.getElementById("portal")) {
      const el = document.createElement("div");
      el.id = "portal";
      document.body.appendChild(el);
    }
  }, []);

  return <Story />;
};

export default withPortalRoot;
