import { test } from "@playwright/test";
import {
  HOODIE,
  SEED_CUSTOMER,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  expectSavedAddressSelected,
  submitOrderAndExpectSuccess,
  loginViaUi,
} from "./helpers/shop";

// Seed customer1 có 1 địa chỉ primary (users.fixture) → flow user là CHỌN địa chỉ
// đã lưu, không điền form như guest
test("user đăng nhập: add to cart → checkout chọn địa chỉ đã lưu → tạo đơn thành công", async ({
  page,
}) => {
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);

  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await expectSavedAddressSelected(page, "Nguyễn Thị Lan", SEED_CUSTOMER.email);
  await submitOrderAndExpectSuccess(page);
});
