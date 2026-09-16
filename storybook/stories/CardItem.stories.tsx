import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardItem from "@/components/ui/CardItem";
import {
  mockProductDetail,
  mockProductDetailNoDiscount,
} from "../mocks/products";

const meta = {
  title: "UI/CardItem",
  component: CardItem,
  tags: ["autodocs"],
  args: {
    productItem: mockProductDetail,
  },
  parameters: {
    a11y: { test: "todo" },
    layout: "centered",
  },
} satisfies Meta<typeof CardItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDiscount: Story = {};

export const NoDiscount: Story = {
  args: { productItem: mockProductDetailNoDiscount },
};

/** Số bán lớn — hàng meta hiển thị dạng rút gọn "1,1k" */
export const SoldCountCompact: Story = {
  args: {
    productItem: { ...mockProductDetail, rating: 4.8, soldCount: 1132 },
  },
};

export const OutOfStock: Story = {
  args: {
    productItem: {
      ...mockProductDetail,
      price: undefined,
      originalPrice: undefined,
      discountPercentage: undefined,
    },
  },
};

/** Cover hàng meta mới: rating (stars) + soldCount ("Đã bán") dưới tên */
export const WithRatingAndSold: Story = {
  args: {
    productItem: {
      ...mockProductDetail,
      rating: 4.8,
      soldCount: 132,
    },
  },
};
