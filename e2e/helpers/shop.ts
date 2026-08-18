import { expect, Page } from "@playwright/test";

// Fixture seed cố định (x-ecommerce-backend/src/seeds/fixtures/products.fixture.ts):
// HOODIE _id 07…0003, mọi tổ hợp variant Đen/Xám × M/L đều còn hàng.
export const HOODIE = {
  name: "Áo Khoác Hoodie Nỉ",
  url: "/product/ao-khoac-hoodie-ni-070000000000000000000003",
  sku: "DEMO-HD01-DEN-M",
  price: "399.000đ",
};

export const SEED_CUSTOMER = {
  email: "customer1@demo.local",
  password: "Demo@123",
};

export async function selectHoodieVariantAndAddToCart(page: Page) {
  await page.getByRole("button", { name: "Đen", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(page.getByText(HOODIE.sku)).toBeVisible();
  await page.getByRole("button", { name: "THÊM VÀO GIỎ HÀNG" }).click();
  await expect(page.getByText("Thêm vào giỏ hàng thành công")).toBeVisible();
}

export async function goToCheckoutFromCart(page: Page) {
  await page.goto("/cart");
  await expect(page.getByText(HOODIE.name).first()).toBeVisible();
  await page.getByRole("button", { name: "Thanh toán" }).click();
  await expect(page).toHaveURL(/\/checkout/);
}

async function pickFirstDropdownOption(page: Page, placeholder: string) {
  await page.getByText(placeholder, { exact: true }).click();
  // Panel option của Dropdown (components/ui/Dropdown.tsx) — KHÔNG dùng div.z-50
  // vì Header cũng là div z-50 fixed, match nhầm sẽ click trúng icon user → đá sang /login
  await page.locator("div.absolute.max-h-64 > div").first().click();
}

export async function fillShippingForm(page: Page, email: string) {
  await page.locator('input[name="fullName"]').fill("Nguyễn Văn E2E");
  await page.locator('input[name="phoneNumber"]').fill("0900123456");
  await page.locator('input[name="email"]').fill(email);
  await pickFirstDropdownOption(page, "Chọn Tỉnh/Thành");
  await pickFirstDropdownOption(page, "Chọn Quận/Huyện");
  await pickFirstDropdownOption(page, "Chọn Phường/Xã");
  await page.locator('input[name="address"]').fill("Số 1 Đường E2E Test");
}

export async function submitOrderAndExpectSuccess(page: Page) {
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.waitForURL(/\/payment-success/);
  await expect(
    page.getByRole("heading", { name: "Đặt hàng thành công" })
  ).toBeVisible();
  await expect(page.getByText(/ORD-\d+-[A-Z0-9]+/)).toBeVisible();
}

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByText("Đăng nhập thành công")).toBeVisible();
  await page.waitForURL("/");
}
