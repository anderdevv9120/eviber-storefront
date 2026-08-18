import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { ImageCell } from "@/components/ui/Table/ImageCell";
import { withPortalRoot } from "../decorators/withPortalRoot";
import { CELL_IMAGE } from "../mocks/uiData";

const meta = {
  title: "UI/Table/ImageCell",
  component: ImageCell,
  tags: ["autodocs"],
  decorators: [withPortalRoot],
  args: {
    itemKeyValue: CELL_IMAGE,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ImageCell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Chỉ hiển thị ảnh, không quick look. */
export const Default: Story = {};

/**
 * isQuickLook: click ảnh → mở Modal preview (render vào #portal).
 * Dùng screen (không phải canvas) vì Modal ở portal.
 */
export const QuickLook: Story = {
  args: { isQuickLook: true },
  play: async ({ canvasElement }) => {
    const thumb = canvasElement.querySelector("img") as HTMLElement;
    await expect(thumb).toBeTruthy();

    await userEvent.click(thumb);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await expect(screen.getByText(/Quick Look/i)).toBeInTheDocument();
  },
};
