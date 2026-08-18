import { test, expect } from "@playwright/test";
import { SEED_CUSTOMER, loginViaUi } from "./helpers/shop";

test("login đúng thông tin → toast thành công, về trang chủ", async ({
  page,
}) => {
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);
});

test("login sai password → hiện lỗi inline, ở lại trang login", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(SEED_CUSTOMER.email);
  await page.locator('input[name="password"]').fill("SaiPassword@123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

  // Lỗi inline đã map tiếng Việt (getByRole("alert") không dùng được —
  // route announcer của Next cũng mang role=alert gây strict violation)
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
