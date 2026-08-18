import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import TableGeneric from "@/components/ui/Table";
import type { TableProps } from "@/components/ui/Table/type";
import { tableColumns, tableData, type DemoRow } from "../mocks/tableData";

// Table là generic <T>; cố định T = DemoRow để có typing chính xác cho meta
// (Storybook không suy được generic → cast về instantiation cụ thể).
const Table = TableGeneric as (props: TableProps<DemoRow>) => ReactElement;

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  args: {
    columns: tableColumns,
    data: tableData,
    rowKey: "id",
  },
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<TableProps<DemoRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Bảng cơ bản, không chọn dòng. */
export const Basic: Story = {};

/** Có checkbox chọn dòng. */
export const WithRowSelection: Story = {
  args: {
    rowSelection: { selectedRowKey: "id", onChange: fn() },
  },
};

/** Có phân trang. */
export const WithPagination: Story = {
  args: {
    pagination: {
      total: 25,
      pageSize: 5,
      currentPage: 1,
      onPageChange: fn(),
    },
  },
};

/** Trạng thái tải. */
export const Loading: Story = {
  args: { isLoading: true, data: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Đang tải dữ liệu/i)).toBeInTheDocument();
  },
};

/** Rỗng → "Không có dữ liệu". */
export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Không có dữ liệu")).toBeInTheDocument();
  },
};

/**
 * Tick 1 dòng → onChange nhận đúng key; tick "select all" → chọn hết.
 */
export const SelectRows: Story = {
  args: {
    rowSelection: { selectedRowKey: "id", onChange: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const onChange = args.rowSelection?.onChange;
    const checkboxes = canvas.getAllByRole("checkbox");
    // checkboxes[0] = select-all ở header, còn lại là từng dòng.
    const firstRow = checkboxes[1];

    // Checkbox input bị ẩn (pointer-events) → click bỏ qua check
    await userEvent.click(firstRow, { pointerEventsCheck: 0 });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(["u1"]));

    // Select all → chọn hết 5 key
    await userEvent.click(checkboxes[0], { pointerEventsCheck: 0 });
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(["u1", "u2", "u3", "u4", "u5"])
    );
  },
};
