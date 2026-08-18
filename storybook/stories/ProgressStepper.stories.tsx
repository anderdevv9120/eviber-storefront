import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ProgressStepper from "@/components/ui/ProgressStepper";
import { STEP_ITEMS } from "../mocks/uiData";

const meta = {
  title: "UI/ProgressStepper",
  component: ProgressStepper,
  tags: ["autodocs"],
  args: {
    stepItems: STEP_ITEMS,
    currentStep: 1,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof ProgressStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1: Story = { args: { currentStep: 1 } };

export const Midway: Story = { args: { currentStep: 2 } };

export const Completed: Story = { args: { currentStep: 3 } };
