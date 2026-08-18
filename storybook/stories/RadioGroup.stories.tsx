import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import { RadioGroup } from "@/components/ui/InputRadio/Radio";

const OPTIONS = [
  { label: "Giao hàng tiêu chuẩn", value: "standard" },
  { label: "Giao hàng nhanh", value: "express" },
  { label: "Nhận tại cửa hàng (tạm hết)", value: "pickup", disabled: true },
];

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: {
    options: OPTIONS,
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: "express" },
};

export const Controlled: Story = {
  args: { value: "standard" },
};

/**
 * Click đổi lựa chọn: chọn "express" → radio đó được check, onChange nhận value.
 */
export const SelectOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    // radios[0] standard, radios[1] express, radios[2] pickup(disabled)
    await expect(radios[1]).not.toBeChecked();

    // Input radio bị style ẩn (pointer-events:none) → click qua label,
    // sát hành vi người dùng và tránh flaky pointer-events.
    await userEvent.click(canvas.getByText("Giao hàng nhanh"));
    await waitFor(() => expect(radios[1]).toBeChecked());
    await expect(args.onChange).toHaveBeenLastCalledWith("express");

    // Đổi sang standard
    await userEvent.click(canvas.getByText("Giao hàng tiêu chuẩn"));
    await waitFor(() => expect(radios[0]).toBeChecked());
    await expect(radios[1]).not.toBeChecked();
  },
};

/**
 * Option disabled không thể chọn.
 */
export const DisabledOptionNotSelectable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios[2]).toBeDisabled();
    await userEvent.click(radios[2], { pointerEventsCheck: 0 });
    await expect(radios[2]).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
