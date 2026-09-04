import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import Button from "@/components/ui/Button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Nút bấm",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "outlined", "secondary", "outline", "danger"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
  },
  parameters: {
    a11y: { test: "todo" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

/**
 * Legacy (các màn chưa redesign): hover đổ đặc nền primary — màn mới dùng `outline`.
 */
export const Outlined: Story = {
  args: { variant: "outlined", children: "Nút viền (legacy)" },
};

/**
 * Hành động phụ đứng cạnh nút đặc (vd nút Google ở login).
 */
export const Secondary: Story = {
  args: { variant: "secondary", children: "Nút phụ" },
};

/**
 * Hành động phụ cần điểm neo trên panel trắng (vd gửi lại email); hover phủ nhẹ.
 */
export const Outline: Story = {
  args: { variant: "outline", children: "Nút viền Pine" },
};

/**
 * Hành động phá hủy trong dialog confirm (xóa địa chỉ) — chỉ nút mang màu đỏ.
 */
export const Danger: Story = {
  args: { variant: "danger", children: "Xóa địa chỉ" },
};

/**
 * Size lg: h-14 + rounded-xl + text-base; primary/outline tự nhận font-bold
 * (compoundVariants), secondary giữ medium.
 */
export const SizeLarge: Story = {
  args: { size: "lg", children: "Nút lớn" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Bị vô hiệu hoá" },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-4">
          <Button {...args} size={size} variant="primary">
            Primary {size}
          </Button>
          <Button {...args} size={size} variant="secondary">
            Secondary {size}
          </Button>
          <Button {...args} size={size} variant="outline">
            Outline {size}
          </Button>
          <Button {...args} size={size} variant="outlined">
            Outlined {size}
          </Button>
          <Button {...args} size={size} variant="primary" disabled>
            Disabled
          </Button>
          <Button {...args} size={size} variant="outline" disabled>
            Disabled
          </Button>
          <Button {...args} size={size} loading>
            Loading
          </Button>
        </div>
      ))}
    </div>
  ),
};

/**
 * Button mặc định phải là type="button" (không submit form vô ý).
 */
export const DefaultsToTypeButton: Story = {
  args: { children: "Kiểm tra type" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: "Kiểm tra type" });
    await expect(btn).toHaveAttribute("type", "button");
  },
};

export const ClickCallsHandler: Story = {
  args: { children: "Bấm thử" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: "Bấm thử" });
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
