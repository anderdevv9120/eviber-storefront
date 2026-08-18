import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ProductPolicy from "@/components/ui/ProductPolicy";
import { POLICIES } from "../mocks/uiData";

const meta = {
  title: "UI/ProductPolicy",
  component: ProductPolicy,
  tags: ["autodocs"],
  args: {
    policies: POLICIES,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ProductPolicy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
