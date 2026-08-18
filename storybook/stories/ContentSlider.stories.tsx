import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import ContentSlider from "@/components/ui/ContentSlider";

const meta = {
  title: "UI/ContentSlider",
  component: ContentSlider,
  tags: ["autodocs"],
  args: {
    title: "Sản phẩm mới",
    href: "/products",
    children: (
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-100 rounded" />
        <div className="h-32 bg-gray-100 rounded" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    ),
  },
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof ContentSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Sản phẩm mới")).toBeInTheDocument();
    await expect(canvas.getByText("Xem tất cả")).toBeInTheDocument();
  },
};
