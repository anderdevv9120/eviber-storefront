import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
import Carousel from "@/components/ui/Carousel";
import { CAROUSEL_IMAGES, SINGLE_IMAGE } from "../mocks/images";

const meta = {
  title: "UI/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  args: {
    images: CAROUSEL_IMAGES,
    // timeAnimation lớn để autoplay không nhiễu interaction test
    timeAnimation: 100000,
  },
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mặc định: hiển thị chấm tròn (dots) dưới ảnh. */
export const Default: Story = {};

/** Có thumbnail dưới thay vì dots (isShowImageBottom). */
export const WithThumbnails: Story = {
  args: { isShowImageBottom: true },
};

/** 1 ảnh — không autoplay, không crash, vẫn render 1 dot. */
export const SingleImage: Story = {
  args: { images: SINGLE_IMAGE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = canvas.getAllByRole("button", { name: /Go to slide/i });
    await expect(dots).toHaveLength(1);
  },
};

/** Mảng rỗng — guard, không chia 0, không crash. */
export const Empty: Story = {
  args: { images: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Không có dot nào; nút chevron (prev/next) vẫn tồn tại nhưng vô hại
    const dots = canvas.queryAllByRole("button", { name: /Go to slide/i });
    await expect(dots).toHaveLength(0);
  },
};

/**
 * Click Next → dot active chuyển sang slide 2; click Prev → quay lại slide 1.
 * Dùng dạng dots (mặc định), assert class active đổi.
 */
export const NextPrevChangesSlide: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = canvas.getAllByRole("button", { name: /Go to slide/i });
    // Ban đầu dot[0] active (scale-125)
    await expect(dots[0].className).toMatch(/scale-125/);

    // ButtonChevron có pointer-events-none tới khi group-hover → bỏ qua check
    const nextBtn = canvas.getByRole("button", { name: "Next slide" });
    await userEvent.click(nextBtn, { pointerEventsCheck: 0 });
    await waitFor(() => expect(dots[1].className).toMatch(/scale-125/));
    await expect(dots[0].className).not.toMatch(/scale-125/);

    const prevBtn = canvas.getByRole("button", { name: "Previous slide" });
    await userEvent.click(prevBtn, { pointerEventsCheck: 0 });
    await waitFor(() => expect(dots[0].className).toMatch(/scale-125/));
  },
};
