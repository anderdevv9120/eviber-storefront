import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import Tabs from "@/components/ui/Tabs";
import { TAB_ITEMS, TAB_ITEMS_WITH_DISABLED } from "../mocks/uiData";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    tabItems: TAB_ITEMS,
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDisabledTab: Story = {
  args: { tabItems: TAB_ITEMS_WITH_DISABLED },
};

/** Click tab khác → panel đổi nội dung + onChange nhận key. */
export const SwitchTab: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Panel đầu = tab "Mô tả"
    await expect(
      canvas.getByText("Nội dung mô tả sản phẩm.")
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("tab", { name: "Đánh giá" }));
    await waitFor(() =>
      expect(
        canvas.getByText("Danh sách đánh giá khách hàng.")
      ).toBeInTheDocument()
    );
    await expect(args.onChange).toHaveBeenLastCalledWith("review");
    // Panel cũ biến mất
    await expect(
      canvas.queryByText("Nội dung mô tả sản phẩm.")
    ).not.toBeInTheDocument();
  },
};

/** Tab disabled không chọn được. */
export const DisabledTabNotSelectable: Story = {
  args: { tabItems: TAB_ITEMS_WITH_DISABLED },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole("tab", { name: "Thông số (khoá)" });
    await expect(disabledTab).toBeDisabled();

    await userEvent.click(disabledTab, { pointerEventsCheck: 0 });
    await expect(args.onChange).not.toHaveBeenCalled();
    // Vẫn ở panel "Mô tả"
    await expect(
      canvas.getByText("Nội dung mô tả sản phẩm.")
    ).toBeInTheDocument();
  },
};
