import React from "react";
import type { Decorator } from "@storybook/nextjs-vite";
import { useAppStore } from "@/store/useAppStore";

/**
 * Reset Zustand `useAppStore` (profile) về trạng thái ban đầu giữa các story,
 * để Authentication không bị lẫn state cũ. Reset SYNC trước render đầu tiên
 * (không dùng useEffect để tránh chớp state cũ).
 */
const StoreResetBoundary = ({ children }: { children: React.ReactNode }) => {
  const resettedRef = React.useRef(false);
  if (!resettedRef.current) {
    useAppStore.getState().clearProfile();
    resettedRef.current = true;
  }
  return <>{children}</>;
};

export const withStore: Decorator = (Story) => (
  <StoreResetBoundary>
    <Story />
  </StoreResetBoundary>
);

export default withStore;
