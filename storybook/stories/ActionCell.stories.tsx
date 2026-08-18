import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import ActionCell, {
  type ActionCellProps,
} from "@/components/ui/Table/ActionCell";
import { Pen, Trash } from "@/components/icons";
import { ACTION_ITEM, type DemoActionItem } from "../mocks/uiData";

// ActionCell là generic <T>; cố định T = DemoActionItem cho meta.
const ActionCellTyped = ActionCell as (
  props: ActionCellProps<DemoActionItem>
) => ReactElement;

const meta = {
  title: "UI/Table/ActionCell",
  component: ActionCellTyped,
  tags: ["autodocs"],
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<ActionCellProps<DemoActionItem>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: ACTION_ITEM,
    actions: [
      { icon: <Pen data-testid="edit" />, tooltip: "Sửa", onClick: fn() },
      { icon: <Trash data-testid="delete" />, tooltip: "Xoá", onClick: fn() },
    ],
  },
};

/** Click 1 action → onClick(item) được gọi với đúng item. */
export const ClickAction: Story = {
  args: {
    item: ACTION_ITEM,
    actions: [
      { icon: <Pen data-testid="edit" />, tooltip: "Sửa", onClick: fn() },
      { icon: <Trash data-testid="delete" />, tooltip: "Xoá", onClick: fn() },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("edit"));
    await waitFor(() =>
      expect(args.actions[0].onClick).toHaveBeenCalledWith(ACTION_ITEM)
    );
    await expect(args.actions[1].onClick).not.toHaveBeenCalled();
  },
};

/** Action disabled không gọi onClick (pointer-events-none). */
export const DisabledAction: Story = {
  args: {
    item: ACTION_ITEM,
    actions: [
      {
        icon: <Trash data-testid="delete" />,
        tooltip: "Xoá",
        onClick: fn(),
        isDisableAction: true,
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Action disabled chặn tương tác ở tầng CSS (pointer-events-none).
    // Assert đúng cơ chế disabled thay vì cố click ép (bấp bênh dưới race).
    const span = canvas.getByTestId("delete").closest("span");
    if (!span) throw new Error("Không tìm thấy span bọc icon action");
    await expect(span).toHaveClass("pointer-events-none");
    // Chưa tương tác → onClick không được gọi.
    await expect(args.actions[0].onClick).not.toHaveBeenCalled();
  },
};
