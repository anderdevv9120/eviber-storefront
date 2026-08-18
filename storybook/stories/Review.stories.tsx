import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
import Review from "@/components/ui/Review";
import { mockReviews } from "../mocks/reviews";

const meta = {
  title: "UI/Review",
  component: Review,
  tags: ["autodocs"],
  args: {
    dataReviews: mockReviews,
  },
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof Review>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mặc định: "Tất cả" đang chọn, hiển thị trang đầu (pageSize = 5). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ĐÁNH GIÁ SẢN PHẨM")).toBeInTheDocument();
    // Trang đầu có tối đa 5 comment
    await expect(canvas.getByText("Người dùng 1")).toBeInTheDocument();
    await expect(canvas.getByText("Người dùng 5")).toBeInTheDocument();
  },
};

/**
 * Click "5 Sao" → chỉ hiển thị comment 5 sao (comment 4-sao biến mất),
 * trang reset về 1.
 */
export const FilterByStars: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Comment 4-sao (id 8) hiện ở "Tất cả" nếu rơi vào trang 1? Không chắc.
    // Nên đi từ nút lọc: bấm "5 Sao".
    await userEvent.click(canvas.getByText(/^5 Sao/));

    await waitFor(async () => {
      // 7 comment 5-sao → trang 1 hiện Người dùng 1..5
      await expect(canvas.getByText("Người dùng 1")).toBeInTheDocument();
    });
    // Không có comment 4-sao (Người dùng 8/9) trên trang hiện tại
    await expect(canvas.queryByText("Người dùng 8")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Người dùng 9")).not.toBeInTheDocument();
  },
};

/**
 * Click "Có hình ảnh · Video" → chỉ comment có ảnh (id 1,2,8).
 */
export const FilterByImages: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(/Có hình ảnh/));

    await waitFor(async () => {
      await expect(canvas.getByText("Người dùng 1")).toBeInTheDocument();
    });
    await expect(canvas.getByText("Người dùng 2")).toBeInTheDocument();
    await expect(canvas.getByText("Người dùng 8")).toBeInTheDocument();
    // Comment không ảnh (id 3) không hiện
    await expect(canvas.queryByText("Người dùng 3")).not.toBeInTheDocument();
  },
};

/**
 * Đổi trang: ở "5 Sao" (7 comment → 2 trang), sang trang 2 hiện Người dùng 6,7.
 */
export const Pagination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(/^5 Sao/));
    await waitFor(async () => {
      await expect(canvas.getByText("Người dùng 1")).toBeInTheDocument();
    });

    // Nút trang "2" trong Pagination
    await userEvent.click(canvas.getByRole("button", { name: "2" }));
    await waitFor(async () => {
      await expect(canvas.getByText("Người dùng 6")).toBeInTheDocument();
    });
    await expect(canvas.getByText("Người dùng 7")).toBeInTheDocument();
  },
};
