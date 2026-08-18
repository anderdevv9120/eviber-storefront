import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, waitFor } from "storybook/test";
import Authentication from "@/components/organisms/Authentication";
import { useAppStore } from "@/store/useAppStore";
import { withStore } from "../decorators/withStore";

/**
 * Authentication là component BOOTSTRAP: render <></>, side-effect khi mount:
 *   - Có cookie accessToken → gọi getProfile() (axios thật) → setProfile.
 *   - Không token → clearProfile().
 *
 * Trong Storybook KHÔNG có cookie accessToken (và không mock axios/cookie),
 * nên nhánh chạy được tin cậy là nhánh "không token → clearProfile()".
 * Story chỉ smoke render-only + panel đọc store để quan sát profile trống.
 * (Xem phần câu hỏi/ghi chú trong báo cáo: mock getProfile/cookie không đáng
 * tin trong Storybook → nên test bằng unit test.)
 */

// Panel debug đọc store để quan sát profile.
const ProfilePanel = () => {
  const profile = useAppStore((s) => s.profile);
  return (
    <div className="p-4 text-sm" data-testid="profile-panel">
      <div>email: &quot;{profile.email}&quot;</div>
      <div>_id: &quot;{profile._id}&quot;</div>
    </div>
  );
};

const meta = {
  title: "Organisms/Authentication",
  component: Authentication,
  tags: ["autodocs"],
  decorators: [withStore],
  parameters: { a11y: { test: "todo" } },
} satisfies Meta<typeof Authentication>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Smoke: không có cookie → clearProfile() → profile.email rỗng.
 * Component tự render <></> (không có DOM riêng), panel đứng cạnh để quan sát.
 */
export const NoToken: Story = {
  render: () => (
    <>
      <Authentication />
      <ProfilePanel />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId("profile-panel")).toHaveTextContent('email: ""')
    );
  },
};
