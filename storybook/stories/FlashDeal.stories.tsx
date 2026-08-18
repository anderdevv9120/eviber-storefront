import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import FlashDeal from "@/components/ui/FlashDeal";

/**
 * FlashDeal dùng setInterval đếm ngược mỗi giây. Story để endTime xa (+1 ngày)
 * và CHỈ assert hiển thị, KHÔNG test hết giờ (tránh flaky theo thời gian thật).
 */
const meta = {
  title: "UI/FlashDeal",
  component: FlashDeal,
  tags: ["autodocs"],
  args: {
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof FlashDeal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("FLASH DEAL")).toBeInTheDocument();
    await expect(canvas.getByText("Kết thúc trong")).toBeInTheDocument();
  },
};
