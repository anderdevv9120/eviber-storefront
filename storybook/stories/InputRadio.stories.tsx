import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import InputRadio from "@/components/ui/InputRadio";
import { RADIO_OPTIONS } from "../mocks/uiData";

/**
 * InputRadio (ui/InputRadio/index) là component generic RIÊNG, khác RadioGroup
 * (ui/InputRadio/Radio đã story ở lô 2): có title, isVertical, options dùng
 * `isDisabled` từng option, click LABEL để chọn (input ẩn qua .scss).
 */
const meta = {
  title: "UI/InputRadio",
  component: InputRadio,
  tags: ["autodocs"],
  args: {
    title: "Giới tính",
    options: RADIO_OPTIONS,
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof InputRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  args: { defaultValue: "female" },
};

export const Vertical: Story = {
  args: { isVertical: true },
};

/** Click label chọn option → radio check + onChange nhận value. */
export const SelectOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios[1]).not.toBeChecked();

    await userEvent.click(canvas.getByText("Nữ"));
    await waitFor(() => expect(radios[1]).toBeChecked());
    await expect(args.onChange).toHaveBeenLastCalledWith("female");
  },
};

/** Option isDisabled không chọn được. */
export const DisabledOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios[2]).toBeDisabled();
    await userEvent.click(radios[2], { pointerEventsCheck: 0 });
    await expect(radios[2]).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
