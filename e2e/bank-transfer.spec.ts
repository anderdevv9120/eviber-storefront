import { test, expect, APIRequestContext } from "@playwright/test";
import {
  HOODIE,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  fillShippingForm,
  expectNoHorizontalOverflow,
} from "./helpers/shop";

const STOREFRONT = "http://localhost:3009/api/v1";
const ADMIN = process.env.E2E_ADMIN_API ?? "http://localhost:8011/admin/v1";
const SEED_ADMIN = { email: "admin@demo.local", password: "Demo@123" };
// Đơn chuyển khoản seed thuộc customer2 (orders.fixture ORD_6) — sweep đăng nhập customer1 nên không đo được ở đó
const SEED_CUSTOMER_2 = { email: "customer2@demo.local", password: "Demo@123" };
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];
const GUEST_EMAIL = "guest-bank@demo.local";

async function loginToken(
  request: APIRequestContext,
  credentials: { email: string; password: string }
) {
  const res = await request.post(`${STOREFRONT}/auth/login`, {
    data: credentials,
  });
  const token = (await res.json())?.data?.accessToken;
  if (!token)
    throw new Error(`Login ${credentials.email} thất bại: ${res.status()}`);
  return token as string;
}

const adminToken = (request: APIRequestContext) =>
  loginToken(request, SEED_ADMIN);

async function lookupOrder(request: APIRequestContext, orderNumber: string) {
  const res = await request.get(`${STOREFRONT}/orders/lookup/${orderNumber}`);
  return (await res.json()).data;
}

/**
 * Nhánh chuyển khoản đầu-cuối: đặt đơn (guest) → màn chờ có QR thật + hạn + copy →
 * admin set paid qua API → trang đang mở tự đổi sang "Đã nhận thanh toán" (polling 15s) →
 * đơn hủy hiện E2 với CTA "Đặt lại các sản phẩm này". Admin API chạy ở E2E_ADMIN_API.
 */
test.describe.configure({ mode: "serial" });

test("guest đặt đơn Chuyển khoản → màn chờ đủ QR / STK / hạn, hạn = +24h", async ({
  page,
  request,
}) => {
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await fillShippingForm(page, GUEST_EMAIL);
  await page.getByTestId("payment-BANK_TRANSFER").click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.waitForURL(/\/payment-success/);

  await expect(
    page.getByRole("heading", { name: "Chuyển khoản để hoàn tất đơn" })
  ).toBeVisible();
  const orderNumber = (
    await page.getByTestId("success-order-number").textContent()
  )?.trim();
  expect(orderNumber).toMatch(/^ORD-/);

  const guide = page.getByTestId("bank-transfer-guide");
  await expect(guide).toContainText("Nội dung");
  await expect(guide).toContainText(orderNumber as string);
  await expect(page.getByTestId("copy-account-number")).toBeVisible();
  await expect(page.getByTestId("copy-transfer-content")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-due")).toHaveText(
    /Còn 2[34] giờ/
  );
  await expect(page.getByText("Chờ thanh toán")).toBeVisible();

  const order = await lookupOrder(request, orderNumber as string);
  const qr = page.getByTestId("bank-transfer-qr");
  const src = await qr.getAttribute("src");
  expect(src).toContain("img.vietqr.io/image/");
  expect(src).toContain(`amount=${order.checkoutInfo.totalPrice}`);
  expect(src).toContain(`addInfo=${orderNumber}`);

  const dueMs =
    new Date(order.paymentDueAt).getTime() -
    new Date(order.created_at).getTime();
  expect(Math.abs(dueMs - 24 * 60 * 60 * 1000)).toBeLessThan(5_000);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 800 });

  // Admin đối soát → trang đang mở tự đổi trong ≤15s, không F5; QR/STK biến mất
  const token = await adminToken(request);
  const patch = await request.patch(
    `${ADMIN}/orders/${order._id}/payment-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { paymentStatus: "paid", note: "e2e", reference: "E2E-001" },
    }
  );
  expect(patch.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: "Đã nhận thanh toán" })
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("bank-transfer-paid")).toContainText(
    "Đã thanh toán"
  );
  await expect(page.getByTestId("bank-transfer-guide")).toHaveCount(0);
  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await expectNoHorizontalOverflow(page);
  }

  // Sau khi paid, polling dừng: không còn request lookup nền
  let lookups = 0;
  page.on("request", (req) => {
    if (req.url().includes("/orders/lookup/")) lookups += 1;
  });
  await page.waitForTimeout(16_000);
  expect(lookups).toBe(0);
});

test("đơn Chuyển khoản đã hủy (fixture) → hero hết hạn/hủy + CTA Đặt lại thêm hàng vào giỏ", async ({
  page,
}) => {
  await page.goto("/payment-success?orderNumber=ORD-SEEDCANCELLED234");
  await expect(page.getByTestId("success-hero-title")).toHaveText(
    /đã hủy|hết hạn/
  );
  await expect(page.getByTestId("bank-transfer-closed")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-guide")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.getByTestId("reorder-products").click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByText("Giày Sneaker Cổ Thấp").first()).toBeVisible();
});

test("chi tiết đơn /user/orders: đơn chuyển khoản chưa trả → khối QR full-width + Hủy đơn, không tràn ngang 3 viewport", async ({
  page,
  request,
}) => {
  const token = await loginToken(request, SEED_CUSTOMER_2);
  await page
    .context()
    .addCookies([
      { name: "accessToken", value: token, domain: "localhost", path: "/" },
    ]);
  await page.goto("/user/orders/ORD-SEEDBANKPENDNG23");

  const block = page.getByTestId("order-bank-transfer");
  await expect(block).toBeVisible();
  await expect(block).toContainText("ORD-SEEDBANKPENDNG23");
  await expect(page.getByTestId("bank-transfer-due")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hủy đơn" })).toBeVisible();

  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await expectNoHorizontalOverflow(page);
  }
});
