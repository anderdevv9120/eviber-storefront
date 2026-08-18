import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import CustomerReview from "@/components/ui/CustomerReview";

/**
 * CustomerReview KHÔNG nhận props — tự import `customerReviews` từ
 * `@/mocks/fetchData`. Đây là coupling cứng: khi xoá ui-kits component
 * sẽ vỡ. Story chỉ render smoke (xem GHI CHÚ trong báo cáo, đề xuất refactor
 * nhận prop nhưng KHÔNG tự sửa src/).
 */
const meta = {
  title: "UI/CustomerReview",
  component: CustomerReview,
  tags: ["autodocs"],
  parameters: { a11y: { test: "todo" }, layout: "fullscreen" },
} satisfies Meta<typeof CustomerReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Có ít nhất 1 tên reviewer từ dữ liệu fetchData
    await expect(canvas.getByText("Robert Fox")).toBeInTheDocument();
  },
};
