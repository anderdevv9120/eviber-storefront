import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import UserSidebar from "@/components/ui/UserSidebar";
import { withStore } from "../decorators/withStore";

/**
 * UserSidebar dùng usePathname/useRouter (mock qua @storybook/nextjs-vite,
 * pathname set qua parameters.nextjs.navigation) + useAppStore (withStore).
 *
 * GHI CHÚ: nút "Đăng xuất" gọi deleteTokenServer() (API thật DELETE /api/auth)
 * + router.push. Storybook không mock API này đáng tin → chỉ render-only,
 * KHÔNG test hành vi logout (giống Authentication). Active item đánh dấu
 * theo pathname.
 */
const meta = {
  title: "UI/UserSidebar",
  component: UserSidebar,
  tags: ["autodocs"],
  decorators: [withStore],
  parameters: {
    a11y: { test: "todo" },
    nextjs: { navigation: { pathname: "/user/my-account" } },
  },
} satisfies Meta<typeof UserSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sidebar mặc định, active = "Tài khoản của tôi" theo pathname. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Danh mục")).toBeInTheDocument();
    // Item active có class nền primary
    const activeLink = canvas
      .getByText("Tài khoản của tôi")
      .closest("a") as HTMLElement;
    await expect(activeLink.className).toContain("border-l-primary");
    await expect(canvas.getByText("Đăng xuất")).toBeInTheDocument();
  },
};

/** Active theo pathname khác → "Đơn hàng". */
export const OrdersActive: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/user/orders" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const activeLink = canvas.getByText("Đơn hàng").closest("a") as HTMLElement;
    await expect(activeLink.className).toContain("border-l-primary");
  },
};

/** Biến thể dropdown (menu mở). */
export const Dropdown: Story = {
  args: { isDropdown: true, isMenuOpen: true },
};
