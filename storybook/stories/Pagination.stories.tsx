import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import Pagination from "@/components/ui/Pagination";

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: {
    total: 100,
    pageSize: 10,
    currentPage: 1,
    onPageChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  args: { currentPage: 1, total: 100 },
};

export const MiddlePage: Story = {
  args: { currentPage: 5, total: 100 },
};

export const LastPage: Story = {
  args: { currentPage: 10, total: 100 },
};

export const FewPages: Story = {
  args: { currentPage: 1, total: 30 },
};

/**
 * Bấm số trang → onPageChange được gọi với đúng số trang.
 */
export const ClickPageNumber: Story = {
  args: { currentPage: 1, total: 100 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page3 = canvas.getByRole("button", { name: "3" });
    await userEvent.click(page3);
    await expect(args.onPageChange).toHaveBeenCalledWith(3);
  },
};

/**
 * Ở trang đầu: nút "trước" bị disable, nút "sau" gọi trang kế tiếp.
 */
export const PrevDisabledOnFirst: Story = {
  args: { currentPage: 1, total: 100 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    const prevBtn = buttons[0];
    await expect(prevBtn).toBeDisabled();

    const nextBtn = buttons[buttons.length - 1];
    await userEvent.click(nextBtn);
    await expect(args.onPageChange).toHaveBeenCalledWith(2);
  },
};
