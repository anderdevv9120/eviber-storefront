import { test, expect } from "@playwright/test";
import { HOODIE, selectHoodieVariantAndAddToCart } from "./helpers/shop";

test("cart: tăng số lượng, xóa item qua modal, trạng thái giỏ trống", async ({
  page,
}) => {
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);

  await page.goto("/cart");
  await expect(page.getByText(HOODIE.name).first()).toBeVisible();
  await expect(page.getByText("1 sản phẩm")).toBeVisible();

  // Counter debounce 1s trước khi PUT update-quantity — expect tự chờ trong timeout
  await page.locator("button.rounded-r-md").first().click();
  await expect(page.getByText("2 sản phẩm")).toBeVisible();

  await page.locator('svg[class*="hover:opacity-70"]').click();
  await expect(page.getByText("Xác nhận xóa")).toBeVisible();
  await page.getByRole("button", { name: "Đồng ý" }).click();

  await expect(page.getByText("Xóa sản phẩm thành công")).toBeVisible();
  await expect(page.getByText("Giỏ hàng trống")).toBeVisible();
  await expect(page.getByRole("button", { name: "Thanh toán" })).toBeDisabled();
});
