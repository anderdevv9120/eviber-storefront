import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import SelectorColor from "@/components/ui/SelectorColor";
import { COLORS } from "../mocks/uiData";

const meta = {
  title: "UI/SelectorColor",
  component: SelectorColor,
  tags: ["autodocs"],
  args: {
    title: "Màu sắc",
    colors: COLORS,
    defaultValue: COLORS[0],
    onChangeColor: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof SelectorColor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Click 1 màu khác → nút đó nhận outline (được chọn) + onChangeColor nhận màu. */
export const SelectColor: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const swatches = canvas.getAllByRole("button");
    // Class nền của Button có sẵn `focus:outline-none` (chứa "outline"),
    // nên phải assert theo class riêng của trạng thái chọn: `outline-offset-2`.
    const SELECTED = "outline-offset-2";
    // Ban đầu màu đầu tiên được chọn
    await expect(swatches[0].className).toContain(SELECTED);
    await expect(swatches[2].className).not.toContain(SELECTED);

    // Click 1 màu khác → onChangeColor nhận đúng màu + swatch đó được chọn
    await userEvent.click(swatches[2]);
    await waitFor(() =>
      expect(args.onChangeColor).toHaveBeenLastCalledWith(COLORS[2])
    );
    await waitFor(() => expect(swatches[2].className).toContain(SELECTED));
    await expect(swatches[0].className).not.toContain(SELECTED);
  },
};
