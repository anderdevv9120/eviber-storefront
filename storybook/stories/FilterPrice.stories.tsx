import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, fn } from "storybook/test";
import FilterPrice from "@/components/ui/FilterPrice";

const meta = {
  title: "UI/FilterPrice",
  component: FilterPrice,
  tags: ["autodocs"],
  args: {
    maxPrice: 1000,
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof FilterPrice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { maxPrice: 1000 },
};

export const SmallRange: Story = {
  args: { maxPrice: 200 },
};

/**
 * Guard chia 0: maxPrice=0 (dữ liệu load bất đồng bộ chưa về) không được gây lỗi runtime.
 * Story render được là đã pass; thêm assertion tối giản là header "Giá" hiển thị.
 */
export const MaxPriceZeroNoCrash: Story = {
  args: { maxPrice: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Giá")).toBeInTheDocument();
  },
};
