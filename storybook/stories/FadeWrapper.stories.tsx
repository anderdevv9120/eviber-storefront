import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import FadeWrapper from "@/components/ui/FadeWrapper";

const meta = {
  title: "UI/FadeWrapper",
  component: FadeWrapper,
  tags: ["autodocs"],
  args: {
    children: <p data-testid="fade-body">Nội dung ẩn/hiện mượt.</p>,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof FadeWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** isVisible=true → grid mở (grid-rows-[1fr] opacity-100). */
export const Visible: Story = {
  args: { isVisible: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas
      .getByTestId("fade-body")
      .closest("div.grid") as HTMLElement;
    await expect(wrapper.className).toContain("grid-rows-[1fr]");
    await expect(wrapper.className).toContain("opacity-100");
  },
};

/** isVisible=false → grid đóng (grid-rows-[0fr] opacity-0). */
export const Hidden: Story = {
  args: { isVisible: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas
      .getByTestId("fade-body")
      .closest("div.grid") as HTMLElement;
    await expect(wrapper.className).toContain("grid-rows-[0fr]");
    await expect(wrapper.className).toContain("opacity-0");
  },
};
