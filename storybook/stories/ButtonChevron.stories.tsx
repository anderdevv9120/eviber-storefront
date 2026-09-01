import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import ButtonChevron from "@/components/ui/ButtonChevron";

/**
 * ButtonChevron mặc định ẩn (opacity-0 pointer-events-none), chỉ hiện khi
 * hover ancestor mang named group `group/rail` (contract của mọi rail/carousel).
 * Trong story bọc trong 1 container relative để định vị;
 * click dùng pointerEventsCheck:0 vì nút ẩn pointer-events.
 */
const meta = {
  title: "UI/ButtonChevron",
  component: ButtonChevron,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="relative group/rail h-40 w-80 border">
        <Story />
      </div>
    ),
  ],
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ButtonChevron>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Left: Story = {};

export const Right: Story = {
  args: { isRightButton: true },
};

/** Click gọi onClick. */
export const ClickTriggersHandler: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: "Previous slide" });
    await userEvent.click(btn, { pointerEventsCheck: 0 });
    await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
  },
};
