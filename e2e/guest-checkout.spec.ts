import { test, expect } from "@playwright/test";
import {
  HOODIE,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  fillShippingForm,
  expectNoHorizontalOverflow,
  submitOrderAndExpectSuccess,
} from "./helpers/shop";

test("guest: browse → chọn variant → cart → checkout tạo đơn thành công", async ({
  page,
}) => {
  await page.goto("/collection");
  await page
    .getByRole("link", { name: new RegExp(HOODIE.name) })
    .first()
    .click();
  await expect(page).toHaveURL(/ao-khoac-hoodie-ni/);

  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await fillShippingForm(page, "guest-e2e@demo.local");
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await submitOrderAndExpectSuccess(page, "Nguyễn Văn E2E");

  // Màn success đủ 6 khối chỉ tồn tại sau khi đặt đơn thật — sweep không dựng được
  // trạng thái này (nó chỉ thấy màn "không tìm thấy đơn"), nên đo ngay tại đây
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
});
