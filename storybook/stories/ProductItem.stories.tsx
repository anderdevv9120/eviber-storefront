import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, fn } from "storybook/test";
import ProductItem from "@/components/ui/ProductItem";
import {
  mockCartItemWithDiscount,
  mockCartItemPlain,
  mockCartItemUnavailable,
} from "../mocks/products";

const meta = {
  title: "UI/ProductItem",
  component: ProductItem,
  tags: ["autodocs"],
  args: {
    item: mockCartItemWithDiscount,
    onQuantityChange: fn(),
    onDeleteClick: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ProductItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDiscountAndAttributes: Story = {};

export const PlainNoDiscount: Story = {
  args: { item: mockCartItemPlain },
};

export const PaymentMode: Story = {
  args: { isPayment: true },
};

export const Unavailable: Story = {
  args: { item: mockCartItemUnavailable, isPayment: true },
};

/**
 * Giá lấy trực tiếp từ BE: price = 960.000đ (giá bán),
 * originalPrice = 1.200.000đ gạch ngang. FE KHÔNG tự tính giảm giá.
 */
export const PriceReflectsDiscount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("960.000đ")).toBeInTheDocument();
    await expect(canvas.getByText("1.200.000đ")).toBeInTheDocument();
    await expect(canvas.getByText("Size 42 · Màu đen")).toBeInTheDocument();
  },
};

/**
 * Không discount: chỉ hiện 1 giá, không có phần "tiết kiệm".
 */
export const PlainPriceNoStrikethrough: Story = {
  args: { item: mockCartItemPlain },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("250.000đ")).toBeInTheDocument();
    await expect(canvas.queryByText(/Tiết kiệm/)).not.toBeInTheDocument();
  },
};
