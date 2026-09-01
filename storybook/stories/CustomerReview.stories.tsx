import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import CustomerReview from "@/components/ui/CustomerReview";
import { IFeaturedReview } from "@/@types/Home.type";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;

/** Fixture demo bám contract GET /reviews/featured (src/@types/Home.type.ts) */
const sampleReviews: IFeaturedReview[] = [
  {
    _id: "review-1",
    displayName: "Minh Anh",
    rating: 5,
    content:
      "Chất vải đẹp hơn mong đợi, giao hàng nhanh. Sẽ quay lại mua tiếp.",
    images: [],
    productName: "Áo len cổ lọ merino",
    productImage: unsplash("photo-1576566588028-4147f3842f27"),
  },
  {
    _id: "review-2",
    displayName: "Quốc Bảo",
    rating: 5,
    content: "Size chuẩn như bảng hướng dẫn, mặc lên phom rất ưng.",
    images: [],
    productName: "Quần jeans slim co giãn",
    productImage: unsplash("photo-1542272604-787c3835535d"),
  },
  {
    _id: "review-3",
    displayName: "Thu Hà",
    rating: 4,
    content: "Đổi trả dễ, hỗ trợ nhiệt tình. Áo khoác dày dặn đáng tiền.",
    images: [],
    productName: "Áo khoác dạ lửng cổ tròn",
    productImage: unsplash("photo-1539533018447-63fcce2678e3"),
  },
  {
    _id: "review-4",
    displayName: "Hoàng Nam",
    rating: 5,
    content: "Mua lần 3 rồi, form dáng ổn định giữa các đợt hàng.",
    images: [],
    productName: "Áo thun basic cổ tròn",
    productImage: unsplash("photo-1521572163474-6864f9cf17ab"),
  },
  {
    // Review không có ảnh sản phẩm — cover degrade về card text
    _id: "review-5",
    displayName: "Lan Phương",
    rating: 4,
    content: "Màu ngoài đời nhạt hơn ảnh một chút nhưng vẫn rất đẹp.",
    images: [],
    productName: "Váy len tăm dáng dài",
    productImage: null,
  },
];

/**
 * CustomerReview nhận danh sách review qua prop `reviews` (shape bám
 * GET /reviews/featured — xem src/@types/Home.type.ts). Trang truyền data
 * từ API; component chỉ lo hiển thị + slider.
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
  args: { reviews: sampleReviews },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Minh Anh")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { reviews: [] },
};
