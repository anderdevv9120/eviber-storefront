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
 * Query theo role + aria (bền với mọi thay đổi style):
 *  - handler chạy → aria-pressed đổi trạng thái
 *  - không điều hướng → link vẫn còn & href không đổi.
 */
export const FavoriteDoesNotNavigate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialHref = canvas.getByRole("link").getAttribute("href");

    const heartButton = canvas.getByRole("button", {
      name: "Yêu thích sản phẩm",
    });
    await expect(heartButton.getAttribute("aria-pressed")).toBe("false");

    await userEvent.click(heartButton);

    // Handler yêu thích đã chạy: aria-pressed đổi trạng thái.
    await waitFor(async () => {
      await expect(heartButton.getAttribute("aria-pressed")).toBe("true");
    });

    // Không điều hướng: link vẫn hiển thị và href không đổi.
    await expect(canvas.getByRole("link").getAttribute("href")).toBe(
      initialHref
    );
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
