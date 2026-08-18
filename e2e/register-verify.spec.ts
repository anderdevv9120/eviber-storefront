import { test, expect } from "@playwright/test";
import { signVerificationToken } from "./helpers/verification-token";

// Email unique mỗi run — DB dev tích lũy account test (chính sách đã chốt trong
// tasks/phase2/todo/e2e-qa-v2.md: user tự chạy lại seed khi thấy vấn đề).
const email = `e2e.reg.${Date.now()}@demo.local`;
const password = "Demo@123";

test("register → verify email bằng token tự ký → login được", async ({
  page,
}) => {
  await page.goto("/register");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="firstName"]').fill("E2e");
  await page.locator('input[name="lastName"]').fill("Nguyễn");
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.getByRole("button", { name: "Đăng ký", exact: true }).click();

  // Register thành công KHÔNG redirect — hiện panel "Kiểm tra hộp thư" tại chỗ
  await expect(page.getByText("Kiểm tra hộp thư của bạn")).toBeVisible();

  // VerifyEmailForm chỉ push về /login khi verify thành công (sau ~2.5s,
  // fail thì ở lại hiện panel lỗi) — waitForURL là assertion cho kết quả verify
  await page.goto(`/verify-email?token=${signVerificationToken(email)}`);
  await page.waitForURL(/\/login/);

  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByText("Đăng nhập thành công")).toBeVisible();
  await page.waitForURL("/");
});
