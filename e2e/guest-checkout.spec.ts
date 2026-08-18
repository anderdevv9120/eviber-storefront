import { test, expect } from "@playwright/test";
import {
  HOODIE,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  fillShippingForm,
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
  await submitOrderAndExpectSuccess(page);
});
