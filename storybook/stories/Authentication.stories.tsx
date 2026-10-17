import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, waitFor } from "storybook/test";
import Authentication from "@/components/organisms/Authentication";
import { useAppStore } from "@/store/useAppStore";
import { withStore } from "../decorators/withStore";

/**
 * Authentication probe GET /api/auth trước khi tải profile: guest xóa store;
 * cookie accessToken hoặc refreshToken httpOnly giữ luồng profile/refresh.
 * Storybook không cung cấp Next route handler này, nên story chỉ smoke render
 * và quan sát store trống; không chứng minh guest detection hay session recovery.
 * Cookie-state contract có unit test, bootstrap/refresh-only có Playwright e2e.
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
 * Smoke render: panel hiển thị profile rỗng sau khi decorator reset store.
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
