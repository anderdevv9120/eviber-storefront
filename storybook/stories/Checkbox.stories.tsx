import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import Checkbox from "@/components/ui/Checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "Đồng ý điều khoản",
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Uncontrolled: tự quản state nội bộ
export const Uncontrolled: Story = {};

export const DefaultChecked: Story = {
  args: { defaultChecked: true },
};

// Controlled: cha quản state (checked cố định)
export const ControlledChecked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true, label: "Không thể chọn" },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true, label: "Khoá + đã chọn" },
};

/** Label gọn cho hàng filter sidebar (collection) — override style mặc định */
export const CompactLabel: Story = {
  args: { labelClassName: "text-sm font-normal text-dark-500" },
};

/**
 * Toggle: uncontrolled → click bật, click lại tắt; onChange nhận boolean.
 */
export const ToggleInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox");
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(box);
    await expect(box).not.toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
  },
};

/**
 * Disabled: click KHÔNG đổi trạng thái, KHÔNG gọi onChange.
 */
export const DisabledDoesNotToggle: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox");
    await userEvent.click(box, { pointerEventsCheck: 0 });
    await expect(box).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
