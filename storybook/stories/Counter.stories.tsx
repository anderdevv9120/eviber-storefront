import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import Counter from "@/components/ui/Counter";

const meta = {
  title: "UI/Counter",
  component: Counter,
  tags: ["autodocs"],
  args: {
    onChangeCount: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: 1 },
};

export const WithMinMax: Story = {
  args: { defaultValue: 3, min: 1, max: 5 },
};

export const Disabled: Story = {
  args: { defaultValue: 2, min: 1, max: 5, disabled: true },
};

/**
 * Pill: 1 khung bo lg, nút ghost bên trong — dùng ở hàng mua product detail.
 */
export const Pill: Story = {
  args: { defaultValue: 1, min: 1, max: 12, variant: "pill" },
};

/**
 * Khởi tạo phải tôn trọng min: defaultValue=0 nhưng min=1 → hiển thị 1.
 */
export const InitRespectsMin: Story = {
  args: { defaultValue: 0, min: 1, max: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;
    await expect(input).toHaveValue(1);
  },
};

/**
 * Clamp: giá trị luôn nằm trong [min,max]; bấm + tới max thì dừng,
 * bấm - tới min thì dừng.
 */
export const ClampWithinRange: Story = {
  args: { defaultValue: 2, min: 1, max: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;
    const buttons = canvas.getAllByRole("button");
    const [decBtn, incBtn] = buttons;

    // Tăng vượt max: 2 -> 3 (max) -> vẫn 3
    await userEvent.click(incBtn);
    await expect(input).toHaveValue(3);
    await userEvent.click(incBtn);
    await expect(input).toHaveValue(3);
    await expect(incBtn).toBeDisabled();

    // Giảm xuống min: 3 -> 2 -> 1 (min) -> vẫn 1
    await userEvent.click(decBtn);
    await userEvent.click(decBtn);
    await expect(input).toHaveValue(1);
    await userEvent.click(decBtn);
    await expect(input).toHaveValue(1);
    await expect(decBtn).toBeDisabled();
  },
};
