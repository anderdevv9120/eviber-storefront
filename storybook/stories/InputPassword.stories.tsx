import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
import InputPassword from "@/components/ui/InputPassword";

const meta = {
  title: "UI/InputPassword",
  component: InputPassword,
  tags: ["autodocs"],
  args: {
    placeholder: "Nhập mật khẩu",
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof InputPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Gõ mật khẩu; click nút mắt → type đổi password↔text. */
export const ToggleVisibility: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(
      "Nhập mật khẩu"
    ) as HTMLInputElement;

    await userEvent.type(input, "secret123");
    await expect(input).toHaveValue("secret123");
    // Mặc định ẩn (password)
    await expect(input).toHaveAttribute("type", "password");

    // Icon mắt là phần tử clickable bên phải input
    const eyeToggle = canvasElement.querySelector(
      ".cursor-pointer"
    ) as HTMLElement;
    await expect(eyeToggle).toBeTruthy();

    await userEvent.click(eyeToggle);
    await waitFor(() => expect(input).toHaveAttribute("type", "text"));

    await userEvent.click(eyeToggle);
    await waitFor(() => expect(input).toHaveAttribute("type", "password"));
  },
};
