import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
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

export const NoDiscountFavorite: Story = {
  args: { productItem: mockProductDetailNoDiscount },
};

export const ShowSavings: Story = {
  args: { isShowDiscountPrice: true },
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

/**
 * P0: Click nút "yêu thích" KHÔNG được điều hướng (Link không kích hoạt).
 * Kiểm tra theo kết quả quan sát được (bền, không phụ thuộc thứ tự event của React):
 *  - handler chạy → trạng thái yêu thích đổi (class icon đổi)
 *  - không điều hướng → link vẫn còn & href không đổi.
 */
export const FavoriteDoesNotNavigate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialHref = canvas.getByRole("link").getAttribute("href");

    // Nút tim là div bọc icon Heart, nằm góc trên phải của ảnh.
    const heartWrapper = canvasElement.querySelector<HTMLDivElement>(
      "div.absolute.top-3.right-3"
    );
    await expect(heartWrapper).toBeTruthy();
    const iconClassBefore =
      heartWrapper!.querySelector("svg")?.getAttribute("class") ?? "";

    await userEvent.click(heartWrapper!);

    // Handler yêu thích đã chạy: class icon đổi trạng thái.
    await waitFor(async () => {
      const iconClassAfter =
        heartWrapper!.querySelector("svg")?.getAttribute("class") ?? "";
      await expect(iconClassAfter).not.toBe(iconClassBefore);
    });

    // Không điều hướng: link vẫn hiển thị và href không đổi.
    await expect(canvas.getByRole("link").getAttribute("href")).toBe(
      initialHref
    );
  },
};
