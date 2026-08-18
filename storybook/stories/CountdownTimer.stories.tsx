import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, waitFor } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import CountdownTimer from "@/components/ui/CountdownTimer";

// Seed sẵn localStorage cho story (chạy sau beforeEach của meta đã dọn key).
const seedStorage = (key: string, seconds: number) => {
  window.localStorage.setItem(key, JSON.stringify(seconds));
};

/**
 * CountdownTimer đọc localStorage key `countdownTimer:<redirectTo>` để khôi
 * phục thời gian còn lại. Xoá key liên quan trước mỗi story để không hiển thị
 * giờ cũ giữa các story. Chỉ test render + định dạng mm:ss (không đếm hết).
 */
const meta = {
  title: "UI/CountdownTimer",
  component: CountdownTimer,
  tags: ["autodocs"],
  args: {
    countdownMinutes: 5,
  },
  beforeEach: async () => {
    // Dọn mọi key countdownTimer:* trước khi render
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("countdownTimer:"))
      .forEach((k) => window.localStorage.removeItem(k));
  },
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof CountdownTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 5 phút → hiển thị "05 : 00" ngay ban đầu. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText(/^05\s*:\s*0[0-9]$/)).toBeInTheDocument()
    );
  },
};

/** 10 phút → hiển thị "10 : 00". */
export const CustomMinutes: Story = {
  args: { countdownMinutes: 10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText(/^10\s*:\s*0[0-9]$/)).toBeInTheDocument()
    );
  },
};

/** CD-3: Đếm ngược mỗi giây (seed 3 → sau ~1s xuống 00:02). */
export const CountsDown: Story = {
  beforeEach: async () => {
    seedStorage("countdownTimer:default", 3);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText(/^00\s*:\s*03$/)).toBeInTheDocument()
    );
    await waitFor(
      () => expect(canvas.getByText(/^00\s*:\s*02$/)).toBeInTheDocument(),
      { timeout: 2500 }
    );
  },
};

/** CD-4: Khôi phục thời gian còn lại từ localStorage (125s → 02:05). */
export const RestoreFromStorage: Story = {
  beforeEach: async () => {
    seedStorage("countdownTimer:default", 125);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByText(/^02\s*:\s*05$/)).toBeInTheDocument()
    );
  },
};

/** CD-5: Hết giờ có redirectTo → router.push đúng 1 lần. */
export const RedirectOnExpiry: Story = {
  args: { redirectTo: "/cart" },
  beforeEach: async () => {
    getRouter().push.mockClear();
    seedStorage("countdownTimer:/cart", 0);
  },
  play: async () => {
    const { push } = getRouter();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/cart"), {
      timeout: 3000,
    });
    // Chờ thêm để chắc chắn không bị gọi lần hai (guard useRef)
    await new Promise((r) => setTimeout(r, 500));
    await expect(push).toHaveBeenCalledTimes(1);
  },
};

/** CD-6: Hết giờ nhưng KHÔNG có redirectTo → không điều hướng. */
export const NoRedirectWithoutTarget: Story = {
  beforeEach: async () => {
    getRouter().push.mockClear();
    seedStorage("countdownTimer:default", 0);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Hết giờ → hiển thị 00 : 00
    await waitFor(() =>
      expect(canvas.getByText(/^00\s*:\s*00$/)).toBeInTheDocument()
    );
    await new Promise((r) => setTimeout(r, 300));
    await expect(getRouter().push).not.toHaveBeenCalled();
  },
};
