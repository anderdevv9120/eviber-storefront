import { Page } from "@playwright/test";

export const PAYMENT_LINK_ROUTE = "**/api/v1/payments/orders/*/link";

export const paymentLinkBody = (seq: number, ttlMs: number) => ({
  statusCode: 200,
  data: {
    qrCode: `00020101021238570010A000000727E2E${seq}`,
    bankBin: "970422",
    accountNumber: "VQRQ0009999",
    accountName: "SHOP E2E",
    amount: 399000,
    description: `CS DHE2E000${seq}`,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    expiresInSeconds: Math.floor(ttlMs / 1000),
  },
});

/**
 * BE e2e chạy với key payOS giả (playwright.config) nên route link thật luôn 503 — MỌI spec mở màn
 * chờ chuyển khoản phải mock tại trình duyệt, kể cả responsive sweep (không mock là đo nhánh lỗi, và
 * BE chạy tay với key thật sẽ tạo link payOS thật). Mỗi lần gọi trả một link khác; ttl từng lần lấy
 * theo `ttls`, hết mảng thì 15 phút.
 */
export async function mockPaymentLink(page: Page, ttls: number[] = []) {
  const calls = { count: 0 };
  await page.route(PAYMENT_LINK_ROUTE, (route) => {
    calls.count += 1;
    return route.fulfill({
      json: paymentLinkBody(calls.count, ttls[calls.count - 1] ?? 15 * 60_000),
    });
  });
  return calls;
}
