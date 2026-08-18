import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
import CardItemSlider from "@/components/ui/CardItemSlider";
import { sliderProducts, fewSliderProducts } from "../mocks/sliderProducts";

const meta = {
  title: "UI/CardItemSlider",
  component: CardItemSlider,
  tags: ["autodocs"],
  args: {
    dataProduct: sliderProducts,
  },
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof CardItemSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mặc định: 8 sản phẩm, có nút next/prev trên desktop. */
export const Default: Story = {};

/** Ít hơn số hiển thị (2 item) — index không âm, không có nút điều hướng. */
export const FewItems: Story = {
  args: { dataProduct: fewSliderProducts },
};

/** Rỗng — hiện Spin "Không có sản phẩm...". */
export const Empty: Story = {
  args: { dataProduct: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Không có sản phẩm/i)).toBeInTheDocument();
  },
};

/**
 * Click Next → transform của track slider đổi (đẩy sang trái).
 * Nút chevron chỉ hiện trên desktop; click bỏ qua pointer-events check.
 */
export const NextPrevSlides: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nextBtn = canvas.queryByRole("button", { name: "Next slide" });
    // Chỉ chạy assert nếu đang ở breakpoint desktop (nút tồn tại)
    if (!nextBtn) return;

    const track = canvasElement.querySelector<HTMLElement>(
      "[style*='translateX']"
    );
    await expect(track).toBeTruthy();
    const before = track?.style.transform;

    await userEvent.click(nextBtn, { pointerEventsCheck: 0 });
    await waitFor(() => expect(track?.style.transform).not.toEqual(before));
  },
};
