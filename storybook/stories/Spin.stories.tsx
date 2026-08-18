import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import Loading from "@/components/ui/Spin";

const meta = {
  title: "UI/Spin",
  component: Loading,
  tags: ["autodocs"],
  args: {
    children: (
      <div className="p-8" data-testid="content">
        Nội dung bên dưới lớp loading.
      </div>
    ),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingState: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Có spinner (role=status)
    await expect(canvas.getByRole("status")).toBeInTheDocument();
  },
};

export const NotLoading: Story = {
  args: { isLoading: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("content")).toBeVisible();
  },
};
