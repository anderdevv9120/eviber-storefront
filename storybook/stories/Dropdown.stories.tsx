import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import Dropdown from "@/components/ui/Dropdown";
import { DROPDOWN_OPTIONS } from "../mocks/uiData";

const meta = {
  title: "UI/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  args: {
    options: DROPDOWN_OPTIONS,
    placeholder: "Chọn sản phẩm",
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefault: Story = {
  args: { defaultValue: "jean" },
};

export const Controlled: Story = {
  args: { value: "sneaker" },
};

/** Label trên control (cùng cách với Input) — form checkout dùng size lg. */
export const WithLabel: Story = {
  args: {
    size: "lg",
    label: "Danh mục",
    labelClassName: "pb-1 text-sm font-medium text-dark-500",
    className: "w-72",
  },
};

/** Mở dropdown → chọn item → nhãn hiển thị đổi + onChange nhận value. */
export const OpenAndSelect: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Ban đầu hiển thị placeholder
    await expect(canvas.getByText("Chọn sản phẩm")).toBeInTheDocument();

    // Mở dropdown (click vào ô hiển thị)
    await userEvent.click(canvas.getByText("Chọn sản phẩm"));
    await waitFor(() => expect(canvas.getByText("Giày sneaker")).toBeVisible());

    // Chọn item
    await userEvent.click(canvas.getByText("Giày sneaker"));
    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith(
        "sneaker",
        expect.objectContaining({ value: "sneaker" })
      )
    );
  },
};

/** Click ra ngoài đóng dropdown (useClickOutside). */
export const CloseOnClickOutside: Story = {
  render: (args) => (
    <div>
      <Dropdown {...args} />
      <button data-testid="outside" className="mt-40">
        Vùng ngoài
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Chọn sản phẩm"));
    await waitFor(() => expect(canvas.getByText("Áo thun")).toBeVisible());

    // Click ra ngoài → danh sách đóng
    await userEvent.click(canvas.getByTestId("outside"));
    await waitFor(() =>
      expect(canvas.queryByText("Quần jean")).not.toBeInTheDocument()
    );
  },
};
