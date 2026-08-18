import { test } from "@playwright/test";
import {
  HOODIE,
  SEED_CUSTOMER,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  fillShippingForm,
  submitOrderAndExpectSuccess,
  loginViaUi,
} from "./helpers/shop";

test("user đăng nhập: add to cart → checkout tạo đơn thành công", async ({
  page,
}) => {
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);

  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await fillShippingForm(page, SEED_CUSTOMER.email);
  await submitOrderAndExpectSuccess(page);
});
