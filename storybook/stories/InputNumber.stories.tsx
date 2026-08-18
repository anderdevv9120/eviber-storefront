import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor, fn } from "storybook/test";
import { useState } from "react";
import InputNumber from "@/components/ui/InputNumber";

// Harness controlled: mô phỏng parent giữ state + bind value/onChange,
// dùng cho các case đồng bộ prop và xóa-trắng-rồi-blur.
function ControlledHarness({ onChange }: { onChange?: (v: number) => void }) {
  const [val, setVal] = useState(5);
  return (
    <div>
      <InputNumber
        value={val}
        min={1}
        max={100}
        onChange={(v) => {
          setVal(v);
          onChange?.(v);
        }}
      />
      <button type="button" onClick={() => setVal(8)}>
        set-8
      </button>
      <span data-testid="parent-value">{val}</span>
    </div>
  );
}

const meta = {
  title: "UI/InputNumber",
  component: InputNumber,
  tags: ["autodocs"],
  args: {
    placeholder: "Nhập số lượng",
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMinMax: Story = {
  args: { min: 1, max: 100, defaultValue: 5 },
};

/** Gõ số hợp lệ → onChange nhận số. */
export const TypeValidNumber: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await userEvent.type(input, "42");
    await waitFor(() => expect(input).toHaveValue(42));
    await expect(args.onChange).toHaveBeenLastCalledWith(42);
  },
};

/** Gõ vượt max → clamp về max (bản vá P0). */
export const ClampToMax: Story = {
  args: { min: 1, max: 100 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    // Gõ 150 (>100) → clamp về 100
    await userEvent.type(input, "150");
    await waitFor(() => expect(input).toHaveValue(100));
    await expect(args.onChange).toHaveBeenLastCalledWith(100);
  },
};

/** Gõ chữ bị chặn (NUMBER_REGEX). */
export const RejectNonNumeric: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await userEvent.type(input, "abc");
    // Không có ký tự số nào được nhận
    await expect(input.value).toBe("");
  },
};

/** IN-4: Gõ dưới min → clamp về min. */
export const ClampToMin: Story = {
  args: { min: 1, max: 100 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await userEvent.type(input, "0");
    await waitFor(() => expect(input).toHaveValue(1));
    await expect(args.onChange).toHaveBeenLastCalledWith(1);
  },
};

/** IN-5: Số 0 đứng đầu bị cắt (truncateLeadingZeros). */
export const TruncateLeadingZeros: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await userEvent.type(input, "007");
    await waitFor(() => expect(input).toHaveValue(7));
    await expect(args.onChange).toHaveBeenLastCalledWith(7);
  },
};

/** IN-6: Controlled — parent đổi value 5→8 thì input đồng bộ. */
export const ControlledSyncFromParent: Story = {
  render: (args) => <ControlledHarness onChange={args.onChange} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await waitFor(() => expect(input).toHaveValue(5));
    await userEvent.click(canvas.getByText("set-8"));
    await waitFor(() => expect(input).toHaveValue(8));
  },
};

/** IN-7: Controlled value=5, xóa trắng → không emit onChange(0). */
export const ClearDoesNotEmitZero: Story = {
  render: (args) => <ControlledHarness onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await waitFor(() => expect(input).toHaveValue(5));
    await userEvent.clear(input);
    await expect(input).toHaveValue(null);
    await expect(args.onChange).not.toHaveBeenCalledWith(0);
  },
};

/** IN-8 (defect#1): Controlled value=5, xóa trắng rồi blur → khôi phục "5". */
export const ClearThenBlurRestores: Story = {
  render: (args) => <ControlledHarness onChange={args.onChange} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await waitFor(() => expect(input).toHaveValue(5));
    await userEvent.clear(input);
    await expect(input).toHaveValue(null);
    // Rời focus → không được kẹt rỗng, phải khôi phục về value hiện tại
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue(5));
  },
};

/** IN-9 (defect#1): Uncontrolled min=2, xóa trắng rồi blur → khôi phục min. */
export const UncontrolledClearBlurRestoresMin: Story = {
  args: { min: 2, defaultValue: 5 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await waitFor(() => expect(input).toHaveValue(5));
    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveValue(2));
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};

/** IN-10: Xóa trắng rồi gõ lại số mới → emit giá trị mới. */
export const ClearThenRetype: Story = {
  render: (args) => <ControlledHarness onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton") as HTMLInputElement;

    await waitFor(() => expect(input).toHaveValue(5));
    await userEvent.clear(input);
    await userEvent.type(input, "9");
    await waitFor(() => expect(input).toHaveValue(9));
    await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(9));
  },
};
