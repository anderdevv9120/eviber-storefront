import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, fn } from "storybook/test";
import FilterPrice from "@/components/ui/FilterPrice";

const meta = {
  title: "UI/FilterPrice",
  component: FilterPrice,
  tags: ["autodocs"],
  args: {
    // Đơn vị đồng (giá trị thật) — hiển thị trực tiếp qua formatPrice
    maxPrice: 1_000_000,
    step: 50_000,
    onChange: fn(),
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof FilterPrice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallRange: Story = {
  args: { maxPrice: 200_000, step: 10_000 },
};

/** Header tùy biến cho sidebar gọn (collection): title + headerClassName */
export const CompactHeader: Story = {
  args: { title: "Khoảng giá", headerClassName: "text-base font-bold" },
};

/** Sidebar gọn: chỉ slider + nhãn giá, ẩn cặp input nhập tay */
export const SliderOnly: Story = {
  args: {
    title: "Khoảng giá",
    headerClassName: "text-base font-bold",
    showInputs: false,
  },
};

/** Khởi tạo theo giá trị ngoài (URL) — collection GĐ2; nhãn phải hiện đúng khoảng truyền vào */
export const InitialRange: Story = {
  args: {
    title: "Khoảng giá",
    showInputs: false,
    initialMin: 150_000,
    initialMax: 650_000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("150.000đ")).toBeInTheDocument();
    await expect(canvas.getByText("650.000đ")).toBeInTheDocument();
  },
};

/**
 * Guard chia 0: maxPrice=0 (dữ liệu load bất đồng bộ chưa về) không được gây lỗi runtime.
 * Story render được là đã pass; thêm assertion tối giản là header "Giá" hiển thị.
 */
export const MaxPriceZeroNoCrash: Story = {
  args: { maxPrice: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Giá")).toBeInTheDocument();
  },
};
