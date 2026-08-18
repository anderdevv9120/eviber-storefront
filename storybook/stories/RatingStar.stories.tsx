import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import RatingStar from "@/components/ui/RatingStar";

const meta = {
  title: "UI/RatingStar",
  component: RatingStar,
  tags: ["autodocs"],
  args: {
    rating: 4,
  },
  argTypes: {
    rating: { control: { type: "number", step: 0.5 } },
  },
  parameters: { a11y: { test: "todo" }, layout: "centered" },
} satisfies Meta<typeof RatingStar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = { args: { rating: 0 } };
export const Half: Story = { args: { rating: 2.5 } };
export const Four: Story = { args: { rating: 4 } };
export const Full: Story = { args: { rating: 5 } };

// Clamp trực quan: >5 và <0 không được vỡ layout (overflow-hidden giữ trong khung 5 sao)
export const AboveMax: Story = { args: { rating: 7 } };
export const Negative: Story = { args: { rating: -2 } };

export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[-2, 0, 1, 2.5, 4, 5, 7].map((r) => (
        <div key={r} className="flex items-center gap-4">
          <span className="w-16 text-sm text-gray-500">rating: {r}</span>
          <RatingStar rating={r} />
        </div>
      ))}
    </div>
  ),
};
