import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import ToggleButton from "@/components/ui/ToggleButton";

const meta = {
  title: "UI/ToggleButton",
  component: ToggleButton,
  tags: ["autodocs"],
  args: {
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: { defaultToggle: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultToggle: true },
};

/** Toggle on↔off qua role=switch, aria-checked đổi + onChange nhận giá trị. */
export const ToggleOnOff: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await expect(sw).toHaveAttribute("aria-checked", "false");

    await userEvent.click(sw);
    await waitFor(() => expect(sw).toHaveAttribute("aria-checked", "true"));
    await expect(args.onChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(sw);
    await waitFor(() => expect(sw).toHaveAttribute("aria-checked", "false"));
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};

/** Disabled không đổi trạng thái, onChange không được gọi. */
export const DisabledNoChange: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch");
    await expect(sw).toHaveAttribute("aria-checked", "false");

    await userEvent.click(sw, { pointerEventsCheck: 0 });
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
