import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import * as Icons from "@/components/icons";

/**
 * Gallery render TẤT CẢ icon export từ src/components/icons/index.tsx.
 * Map object export → lưới hiển thị tên + icon. Render-only.
 */
const IconGrid = () => {
  const entries = Object.entries(Icons) as [string, ComponentType<any>][];
  return (
    <div className="grid grid-cols-4 gap-4 p-4 sm:grid-cols-6">
      {entries.map(([name, Icon]) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center text-primary-700">
            <Icon />
          </div>
          <span className="break-all text-xs text-gray-600">{name}</span>
        </div>
      ))}
    </div>
  );
};

const meta = {
  title: "Icons/Gallery",
  component: IconGrid,
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof IconGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {};
