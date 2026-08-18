import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import ErrorMessage from "@/components/ui/ErrorMessage";

const meta = {
  title: "UI/ErrorMessage",
  component: ErrorMessage,
  tags: ["autodocs"],
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMessage: Story = {
  args: { message: "Trường này là bắt buộc" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Trường này là bắt buộc")
    ).toBeInTheDocument();
  },
};

/** message rỗng → component trả về null (không render gì). */
export const Empty: Story = {
  args: { message: "" },
  play: async ({ canvasElement }) => {
    // Không có text nào được render
    await expect(canvasElement.querySelector("p")).toBeNull();
  },
};
