import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ItemPrice from "@/components/ui/ItemPrice";

const meta = {
  title: "UI/ItemPrice",
  component: ItemPrice,
  tags: ["autodocs"],
  args: {
    price: 500000,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ItemPrice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoDiscount: Story = {};

export const WithDiscount: Story = {
  args: { price: 400000, originalPrice: 500000, isShowDiscountPrice: true },
};

export const Vertical: Story = {
  args: {
    price: 425000,
    originalPrice: 500000,
    isShowDiscountPrice: true,
    isVertical: true,
  },
};

export const NoPrice: Story = {
  args: { price: undefined },
};
