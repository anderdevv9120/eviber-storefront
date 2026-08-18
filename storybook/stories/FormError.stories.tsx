import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, waitFor } from "storybook/test";
import FormError from "@/components/ui/FormError";
import { withForm } from "../decorators/withForm";

/**
 * FormError đọc lỗi field từ useFormContext(). Cần form context (withForm)
 * và phải có lỗi field mới hiển thị. Ta set lỗi chủ động qua setError trong
 * 1 helper nhỏ (SetFieldError) để story tự chứa, không cần submit thật.
 */
const SetFieldError = ({
  name,
  message,
}: {
  name: string;
  message: string;
}) => {
  const { setError } = useFormContext();
  useEffect(() => {
    setError(name, { type: "manual", message });
  }, [name, message, setError]);
  return null;
};

const meta = {
  title: "UI/FormError",
  component: FormError,
  tags: ["autodocs"],
  decorators: [withForm],
  args: { name: "email" },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof FormError>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Có lỗi field → hiển thị message. */
export const WithError: Story = {
  render: (args) => (
    <>
      <SetFieldError name="email" message="Email không hợp lệ" />
      <FormError {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText("Email không hợp lệ")).toBeInTheDocument()
    );
  },
};

/** Không có lỗi → không render gì. */
export const NoError: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("p")).toBeNull();
  },
};
