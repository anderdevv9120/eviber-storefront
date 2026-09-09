import { expect, Page } from "@playwright/test";

// Fixture seed cố định (backend/src/seeds/fixtures/products.fixture.ts):
// HOODIE _id 07…0003, mọi tổ hợp variant Đen/Xám × M/L đều còn hàng.
// URL slug thuần (chốt phase2) — seed sinh slug không gắn timestamp nên ổn định.
export const HOODIE = {
  name: "Áo Khoác Hoodie Nỉ",
  url: "/product/ao-khoac-hoodie-ni",
  price: "399.000đ",
};

export const SEED_CUSTOMER = {
  email: "customer1@demo.local",
  password: "Demo@123",
};

export async function selectHoodieVariantAndAddToCart(page: Page) {
  await page.getByRole("button", { name: "Đen", exact: true }).click();
  await page.getByRole("button", { name: "M", exact: true }).click();
  // Label nhóm variant hiển thị value đang chọn — neo stateless chứng minh đúng
  // tổ hợp được chọn (UI redesign không show SKU; tồn kho là số STATEFUL, spec
  // trước trong cùng run mua hàng làm nó giảm — đừng neo vào "Còn N sản phẩm")
  await expect(page.getByText("Màu sắc: Đen")).toBeVisible();
  await expect(page.getByText("Kích thước: M")).toBeVisible();
  await page.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
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
  // Danh sách xã lazy-import theo tỉnh — chờ dropdown hết disabled rồi mới mở
  await page
    .locator(
      '[role="combobox"]:has-text("Chọn Phường/Xã"):not([aria-disabled])'
    )
    .waitFor();
  await pickFirstDropdownOption(page, "Chọn Phường/Xã");
  await page.locator('input[name="address"]').fill("Số 1 Đường E2E Test");
}

/**
 * User đăng nhập có sổ địa chỉ → checkout hiện danh sách radio card thay vì form;
 * địa chỉ mặc định được chọn sẵn, chỉ cần email (prefill) rồi Đặt hàng.
 */
export async function expectSavedAddressSelected(
  page: Page,
  recipientName: string,
  email: string
) {
  await expect(
    page.getByRole("radio", { name: new RegExp(recipientName) })
  ).toBeChecked();
  await expect(page.getByTestId("checkout-account-email")).toContainText(email);
}

/** Định nghĩa duy nhất của "không tràn ngang" — dùng cho sweep lẫn spec flow */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  // +1px dung sai làm tròn subpixel
  expect(
    scrollWidth,
    `trang tràn ngang: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`
  ).toBeLessThanOrEqual(clientWidth + 1);
}

export async function submitOrderAndExpectSuccess(
  page: Page,
  recipientName: string
) {
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.waitForURL(/\/payment-success/);
  await expect(
    page.getByRole("heading", { name: "Đã nhận đơn của bạn" })
  ).toBeVisible();
  await expect(page.getByTestId("success-order-number")).toHaveText(
    /^ORD-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{16}$/
  );
  // Đơn rà soát được: sản phẩm + tiền + địa chỉ giao đều có mặt
  await expect(page.getByTestId("success-summary")).toBeVisible();
  // Bám dữ liệu người nhận, không bám cấp thẻ — "Giao đến" là nhãn nhỏ, không phải heading
  await expect(page.getByTestId("success-shipping")).toContainText(
    recipientName
  );
}

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByText("Đăng nhập thành công")).toBeVisible();
  await page.waitForURL("/");
}
