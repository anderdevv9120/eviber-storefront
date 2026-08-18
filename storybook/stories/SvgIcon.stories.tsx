import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SvgIcon from "@/components/ui/SvgIcon";

/**
 * SvgIcon render <use xlinkHref="/sprites.svg#icon-{name}"/>.
 * Sprite thật nằm ở /public; nếu thiếu, icon chỉ không hiển thị hình,
 * component vẫn render an toàn (chỉ smoke render).
 */
const meta = {
  title: "UI/SvgIcon",
  component: SvgIcon,
  tags: ["autodocs"],
  args: {
    name: "cart",
    width: 32,
    height: 32,
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof SvgIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
