import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent } from "storybook/test";
import Input from "@/components/ui/Input";
import { withForm } from "../decorators/withForm";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Họ và tên",
    placeholder: "Nhập họ và tên",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["outlined", "standard", "filled"],
    },
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Standalone (không form) ---
export const Standalone: Story = {};

export const Standard: Story = {
  args: { variant: "standard" },
};

export const Filled: Story = {
  args: { variant: "filled" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Không thể nhập" },
};

export const TypingUpdatesValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Nhập họ và tên");
    await userEvent.type(input, "Nguyễn Văn A");
    await expect(input).toHaveValue("Nguyễn Văn A");
  },
};

// --- Form-integrated (nhận biết form qua useFormContext) ---
export const FormIntegrated: Story = {
  args: {
    name: "fullName",
    label: "Họ và tên (form)",
    required: "Bắt buộc nhập họ tên",
  },
  decorators: [withForm],
  parameters: {
    reactHookForm: { defaultValues: { fullName: "Giá trị mặc định" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Được bind qua Controller nên có sẵn defaultValue
    const input = canvas.getByDisplayValue("Giá trị mặc định");
    await expect(input).toBeInTheDocument();
  },
};

export const FormWithError: Story = {
  args: {
    name: "email",
    label: "Email (form)",
    required: "Vui lòng nhập email",
    placeholder: "email@example.com",
  },
  decorators: [withForm],
};
