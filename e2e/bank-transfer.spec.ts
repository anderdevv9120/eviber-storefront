import { test, expect, APIRequestContext } from "@playwright/test";
import {
  HOODIE,
  SEED_CUSTOMER,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  fillShippingForm,
  expectNoHorizontalOverflow,
  expectSavedAddressSelected,
  loginViaUi,
} from "./helpers/shop";
import {
  PAYMENT_LINK_ROUTE as LINK_ROUTE,
  mockPaymentLink,
  paymentLinkBody as linkBody,
} from "./helpers/payment-link";

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
  credentials: { email: string; password: string },
  baseUrl = STOREFRONT
) {
  const res = await request.post(`${baseUrl}/auth/login`, {
    data: credentials,
  });
  const token = (await res.json())?.data?.accessToken;
  if (!token)
    throw new Error(`Login ${credentials.email} thất bại: ${res.status()}`);
  return token as string;
}

// Admin API chỉ nhận token ký bởi chính cổng admin (secret riêng) — token storefront bị 401
const adminToken = (request: APIRequestContext) =>
  loginToken(request, SEED_ADMIN, ADMIN);

async function lookupOrder(request: APIRequestContext, orderNumber: string) {
  const res = await request.get(`${STOREFRONT}/orders/lookup/${orderNumber}`);
  return (await res.json()).data;
}

/**
 * Nhánh chuyển khoản đầu-cuối: đặt đơn (guest) → màn chờ có QR payOS + STK + hạn + copy →
 * mã QR hết hạn thì tạo mã mới → đơn chuyển paid (qua admin API; đường webhook ghim ở jest BE
 * payos-gateway.spec) → trang đang mở tự đổi sang "Đã nhận thanh toán" (polling 5s) →
 * đơn hủy hiện E2 với CTA "Đặt lại các sản phẩm này". Admin API chạy ở E2E_ADMIN_API.
 */
test.describe.configure({ mode: "serial" });

test("guest đặt đơn Chuyển khoản → màn chờ đủ QR payOS / STK / hạn, QR hết hạn tạo mã mới, paid tự đổi ≤5s", async ({
  page,
  request,
}) => {
  // Link đầu sống 8s: đủ cho các assert QR/STK chạy xong trên máy chậm trước khi hết hạn (expect timeout 10s)
  const linkCalls = await mockPaymentLink(page, [8_000]);
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await fillShippingForm(page, GUEST_EMAIL);
  await page.getByTestId("payment-BANK_TRANSFER").click();
  // Ô xem trước QR chỉ mở khi chọn chuyển khoản — sweep responsive load checkout mặc định COD nên không thấy
  await expect(page.getByTestId("qr-slot")).toContainText(HOODIE.price);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.waitForURL(/\/payment-success/);

  await expect(
    page.getByRole("heading", { name: "Chuyển khoản để hoàn tất đơn" })
  ).toBeVisible();
  const orderNumber = (
    await page.getByTestId("success-order-number").textContent()
  )?.trim();
  expect(orderNumber).toMatch(/^ORD-/);

  // Lối ra lúc đang chờ: link chữ + hạn giữ đơn; guest không có sổ đơn nên không có link "Đơn hàng của tôi"
  const leaveHint = page.getByTestId("awaiting-leave-hint");
  await expect(leaveHint).toContainText("Đơn được giữ tới");
  await expect(leaveHint).not.toContainText("Đơn hàng của tôi");
  await expect(
    page.getByRole("button", { name: "Tiếp tục mua sắm" })
  ).toBeVisible();

  const guide = page.getByTestId("bank-transfer-guide");
  await expect(guide).toContainText("MB Bank");
  await expect(guide).toContainText("VQRQ0009999");
  await expect(guide).toContainText("CS DHE2E0001");
  await expect(page.getByTestId("copy-account-number")).toBeVisible();
  await expect(page.getByTestId("copy-transfer-content")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-due")).toHaveText(
    /Còn 2[34] giờ/
  );
  await expect(page.getByText("Chờ thanh toán")).toBeVisible();

  const order = await lookupOrder(request, orderNumber as string);
  await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();

  const dueMs =
    new Date(order.paymentDueAt).getTime() -
    new Date(order.created_at).getTime();
  expect(Math.abs(dueMs - 24 * 60 * 60 * 1000)).toBeLessThan(5_000);

  // Mã QR hết hạn mà đơn còn hạn: ô QR + STK nhường chỗ cho nút tạo mã mới
  await expect(page.getByTestId("payment-link-expired")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-qr")).toHaveCount(0);
  await expect(page.getByTestId("copy-account-number")).toHaveCount(0);
  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await expectNoHorizontalOverflow(page);
  }
  await page.getByRole("button", { name: "Tạo mã QR mới" }).click();
  await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();
  await expect(guide).toContainText("CS DHE2E0002");
  expect(linkCalls.count).toBe(2);
  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await expectNoHorizontalOverflow(page);
  }

  // Nhịp polling 5s: 11s chỉ được ≤3 lượt lookup (≤12/phút, dưới throttle 20/60s)
  let pollLookups = 0;
  const countPoll = (req: { url(): string }) => {
    if (req.url().includes("/orders/lookup/")) pollLookups += 1;
  };
  page.on("request", countPoll);
  await page.waitForTimeout(11_000);
  page.off("request", countPoll);
  expect(pollLookups).toBeGreaterThanOrEqual(1);
  expect(pollLookups).toBeLessThanOrEqual(3);

  // Tiền về → trang đang mở tự đổi trong ≤5s (+ trễ mạng), không F5; QR/STK biến mất
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
  ).toBeVisible({ timeout: 7_000 });
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
  await page.waitForTimeout(7_000);
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
  await mockPaymentLink(page);
  const token = await loginToken(request, SEED_CUSTOMER_2);
  await page
    .context()
    .addCookies([
      { name: "accessToken", value: token, domain: "localhost", path: "/" },
    ]);
  await page.goto("/user/orders/ORD-SEEDBANKPENDNG23");

  const block = page.getByTestId("order-bank-transfer");
  await expect(block).toBeVisible();
  await expect(block).toContainText("CS DHE2E0001");
  await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-due")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hủy đơn" })).toBeVisible();

  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await expectNoHorizontalOverflow(page);
  }
});

test("user đăng nhập đặt đơn Chuyển khoản → hint có link sổ đơn; chi tiết đơn tự đổi paid và ẩn Hủy đơn", async ({
  page,
  request,
}) => {
  await mockPaymentLink(page);
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await expectSavedAddressSelected(page, "Nguyễn Thị Lan", SEED_CUSTOMER.email);
  await page.getByTestId("payment-BANK_TRANSFER").click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.waitForURL(/\/payment-success/);

  const leaveHint = page.getByTestId("awaiting-leave-hint");
  await expect(
    leaveHint.getByRole("link", { name: "Đơn hàng của tôi" })
  ).toHaveAttribute("href", "/user/orders");
  const orderNumber = (
    await page.getByTestId("success-order-number").textContent()
  )?.trim();

  await page.goto(`/user/orders/${orderNumber}`);
  await expect(page.getByTestId("order-bank-transfer")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hủy đơn" })).toBeVisible();

  // Tiền về lúc đang mở trang chi tiết: polling cùng cơ chế với màn chờ, nút Hủy đơn phải biến mất
  const order = await lookupOrder(request, orderNumber as string);
  const token = await adminToken(request);
  const patch = await request.patch(
    `${ADMIN}/orders/${order._id}/payment-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { paymentStatus: "paid", note: "e2e", reference: "E2E-002" },
    }
  );
  expect(patch.ok()).toBeTruthy();
  // Chi tiết đơn không có khối "đã thanh toán" riêng như màn chờ: khối QR biến mất, dòng thanh toán đổi nhãn
  await expect(page.getByText(/^Đã thanh toán ·/)).toBeVisible({
    timeout: 7_000,
  });
  await expect(page.getByTestId("order-bank-transfer")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hủy đơn" })).toHaveCount(0);
});

test("tiền về đúng lúc mã QR vừa hết hạn → trang vẫn tự đổi paid trong cửa sổ grace, không kẹt ở Tạo mã QR mới", async ({
  page,
  request,
}) => {
  await mockPaymentLink(page, [4_000]);
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await goToCheckoutFromCart(page);
  await fillShippingForm(page, GUEST_EMAIL);
  await page.getByTestId("payment-BANK_TRANSFER").click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.waitForURL(/\/payment-success/);
  const orderNumber = (
    await page.getByTestId("success-order-number").textContent()
  )?.trim();
  await expect(page.getByTestId("payment-link-expired")).toBeVisible();

  const order = await lookupOrder(request, orderNumber as string);
  const token = await adminToken(request);
  const patch = await request.patch(
    `${ADMIN}/orders/${order._id}/payment-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { paymentStatus: "paid", note: "e2e", reference: "E2E-003" },
    }
  );
  expect(patch.ok()).toBeTruthy();
  await expect(
    page.getByRole("heading", { name: "Đã nhận thanh toán" })
  ).toBeVisible({ timeout: 15_000 });
});

test("payOS lỗi → khối chuyển khoản báo chưa tạo được mã + Thử lại, bấm lại thì có QR", async ({
  page,
}) => {
  let calls = 0;
  await page.route(LINK_ROUTE, (route) => {
    calls += 1;
    return calls === 1
      ? route.fulfill({ status: 503, json: { statusCode: 503 } })
      : route.fulfill({ json: linkBody(calls, 15 * 60_000) });
  });
  await page.goto("/payment-success?orderNumber=ORD-SEEDBANKPENDNG23");

  await expect(page.getByTestId("payment-link-error")).toBeVisible();
  await expect(page.getByTestId("bank-transfer-qr")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();
});

test("BE báo đơn không còn chờ thanh toán (400) → không mời thử lại vô hạn, chỉ còn nút tải lại trang", async ({
  page,
}) => {
  await page.route(LINK_ROUTE, (route) =>
    route.fulfill({ status: 400, json: { statusCode: 400 } })
  );
  await page.goto("/payment-success?orderNumber=ORD-SEEDBANKPENDNG23");

  await expect(page.getByTestId("payment-link-closed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Thử lại" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tải lại trang" })
  ).toBeVisible();
});

test("BIN ngân hàng lạ → ẩn dòng Ngân hàng, STK và QR vẫn hiện", async ({
  page,
}) => {
  await page.route(LINK_ROUTE, (route) => {
    const body = linkBody(1, 15 * 60_000);
    return route.fulfill({
      json: { ...body, data: { ...body.data, bankBin: "999999" } },
    });
  });
  await page.goto("/payment-success?orderNumber=ORD-SEEDBANKPENDNG23");

  const guide = page.getByTestId("bank-transfer-guide");
  await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();
  await expect(guide).toContainText("VQRQ0009999");
  await expect(guide).not.toContainText("Ngân hàng");
});
