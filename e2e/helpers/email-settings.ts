// Cấu hình Gmail GIẢ cho BE e2e — BE chỉ chấp nhận khi chạy với EMAIL_FAKE_TRANSPORT=true (bỏ bước đăng nhập Gmail,
// mail không rời máy). Document này nằm lại trong DB: BE dev chạy tay không có biến đó sẽ thử gửi bằng App Password
// giả và log lỗi; muốn gửi thật thì vào CMS › Cài đặt › Email nhập lại.
const E2E_EMAIL_SETTINGS = {
  address: "shop-e2e@demo.local",
  appPassword: "e2enotarealpassw",
  senderName: "Shop E2E",
};

const SEED_ADMIN = { email: "admin@demo.local", password: "Demo@123" };

/** Spec cần luồng "đã cấu hình mail" (đăng ký phải xác thực, gửi link hoàn tiền) — DB trống thì đăng ký tạo VERIFIED */
export async function ensureEmailConfigured(adminApi: string) {
  const login = await fetch(`${adminApi}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(SEED_ADMIN),
  });
  const token = (await login.json())?.data?.accessToken;
  if (!token) throw new Error(`Login admin e2e thất bại: ${login.status}`);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const current = (
    await (await fetch(`${adminApi}/email-settings`, { headers })).json()
  )?.data;
  if (!current) throw new Error("Không đọc được cấu hình email từ admin API");
  if (current.status === "configured") return;

  const res = await fetch(`${adminApi}/email-settings`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...E2E_EMAIL_SETTINGS, revision: current.revision }),
  });
  if (!res.ok)
    throw new Error(
      `Lưu cấu hình email e2e thất bại: ${res.status} — BE e2e phải chạy với EMAIL_FAKE_TRANSPORT=true`
    );
}
