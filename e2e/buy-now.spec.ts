import { test, expect } from "@playwright/test";
import { HOODIE } from "./helpers/shop";

// "Mua ngay" = addToCart + điều hướng thẳng /cart (chốt buy-row product detail) —
// flow mua chính thứ hai bên cạnh "Thêm vào giỏ hàng" (đã cover ở 3 spec checkout).
test("guest: Mua ngay từ product detail → vào thẳng /cart với item vừa chọn", async ({
  page,
}) => {
  await page.goto(HOODIE.url);
  await page.getByRole("button", { name: "Đen", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(page.getByText("Màu sắc: Đen")).toBeVisible();

  await page.getByRole("button", { name: "Mua ngay" }).click();

  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByText(HOODIE.name).first()).toBeVisible();
});
