import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
import Accordion from "@/components/ui/Accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    headerTitle: "Chi tiết sản phẩm",
    children: <p data-testid="acc-body">Nội dung mô tả chi tiết.</p>,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mặc định mở (isCollapse=true → FadeWrapper isVisible=true). */
export const Default: Story = {};

/** Header gọn cho sidebar filter (collection) — override style mặc định */
export const CompactHeader: Story = {
  args: { headerClassName: "text-base font-bold" },
};

/**
 * Nội dung luôn nằm trong DOM (FadeWrapper dùng grid-rows để ẩn/hiện).
 * Ta quan sát trạng thái đóng/mở qua class trên wrapper FadeWrapper:
 * mở = grid-rows-[1fr] opacity-100, đóng = grid-rows-[0fr] opacity-0.
 */
export const Collapsed: Story = {};

/** Click header → toggle: từ mở (grid-rows-[1fr]) sang đóng (grid-rows-[0fr]) và ngược lại. */
export const ToggleOnHeaderClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = canvas.getByTestId("acc-body");
    // FadeWrapper là phần tử grid bao quanh body
    const fadeWrapper = body.closest("div.grid") as HTMLElement;
    await expect(fadeWrapper).toBeTruthy();

    // Mặc định mở
    await expect(fadeWrapper.className).toContain("grid-rows-[1fr]");

    // Click header (tiêu đề) → đóng
    await userEvent.click(canvas.getByText("Chi tiết sản phẩm"));
    await waitFor(() =>
      expect(fadeWrapper.className).toContain("grid-rows-[0fr]")
    );

    // Click lại → mở
    await userEvent.click(canvas.getByText("Chi tiết sản phẩm"));
    await waitFor(() =>
      expect(fadeWrapper.className).toContain("grid-rows-[1fr]")
    );
  },
};
