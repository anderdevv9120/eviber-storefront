import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import Selector from "@/components/ui/Selector";

const OPTIONS = [
  { label: "S", value: "s" },
  { label: "M", value: "m" },
  { label: "L (hết hàng)", value: "l", isAvailable: false },
  { label: "XL", value: "xl" },
];

const meta = {
  title: "UI/Selector",
  component: Selector,
  tags: ["autodocs"],
  args: {
    options: OPTIONS,
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Selector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: "m" },
};

export const Controlled: Story = {
  args: { value: "xl" },
};

/**
 * Click item khả dụng → được chọn + onChange nhận value.
 */
export const SelectAvailable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const itemM = canvas.getByText("M");
    await userEvent.click(itemM);
    await expect(args.onChange).toHaveBeenCalledWith(
      "m",
      expect.objectContaining({ value: "m" })
    );
  },
};

/**
 * Click item isAvailable=false → KHÔNG được chọn, KHÔNG gọi onChange.
 */
export const UnavailableNotSelectable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const itemL = canvas.getByText("L (hết hàng)");
    await userEvent.click(itemL, { pointerEventsCheck: 0 });
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(itemL).not.toHaveClass("text-primary");
  },
};
