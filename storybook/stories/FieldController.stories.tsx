import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, waitFor } from "storybook/test";
import { useFormContext } from "react-hook-form";
import FieldController from "@/components/ui/FieldController";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import { withForm } from "../decorators/withForm";

/**
 * FieldController là helper RHF: cần FormProvider (withForm) + 1 child element.
 * Kiểm chứng bản vá P0 nhánh `isBoolean ? {checked} : {value}`:
 *   (a) TextField — bọc Input, gõ → form.value cập nhật.
 *   (b) BooleanField — bọc Checkbox, toggle → form nhận `checked` boolean.
 * Panel debug đọc watch() để interaction assert giá trị form quan sát được.
 */

// Panel debug: in giá trị field ra DOM để play() assert.
const DebugValue = ({ name }: { name: string }) => {
  const { watch } = useFormContext();
  const value = watch(name);
  return (
    <div data-testid={`debug-${name}`}>{JSON.stringify(value ?? null)}</div>
  );
};

const meta = {
  title: "UI/FieldController",
  component: FieldController,
  tags: ["autodocs"],
  decorators: [withForm],
  // args mặc định để thoả type; các story dùng render() riêng nên args này
  // không được sử dụng trực tiếp.
  args: {
    name: "placeholder",
    children: <input />,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof FieldController>;

export default meta;
type Story = StoryObj<typeof meta>;

/** (a) TextField: gõ vào input → giá trị form "username" cập nhật. */
export const TextField: Story = {
  parameters: { reactHookForm: { defaultValues: { username: "" } } },
  render: () => (
    <div className="p-6 max-w-sm">
      <FieldController name="username" title="Tên đăng nhập">
        <Input placeholder="Nhập tên" />
      </FieldController>
      <DebugValue name="username" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Nhập tên");
    await userEvent.type(input, "miracle");
    await waitFor(() =>
      expect(canvas.getByTestId("debug-username")).toHaveTextContent(
        '"miracle"'
      )
    );
  },
};

/**
 * (b) BooleanField: default true → FieldController truyền `checked`.
 * Toggle → form nhận boolean đúng.
 */
export const BooleanField: Story = {
  parameters: { reactHookForm: { defaultValues: { agree: true } } },
  render: () => (
    <div className="p-6 max-w-sm">
      <FieldController name="agree">
        <Checkbox label="Đồng ý điều khoản" />
      </FieldController>
      <DebugValue name="agree" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const debug = canvas.getByTestId("debug-agree");
    // Ban đầu true (defaultValues)
    await expect(debug).toHaveTextContent("true");

    // Toggle qua label (input ẩn) → false
    await userEvent.click(canvas.getByText("Đồng ý điều khoản"));
    await waitFor(() => expect(debug).toHaveTextContent("false"));

    // Toggle lại → true (đảm bảo nhận boolean, không phải "on"/string)
    await userEvent.click(canvas.getByText("Đồng ý điều khoản"));
    await waitFor(() => expect(debug).toHaveTextContent("true"));
  },
};
