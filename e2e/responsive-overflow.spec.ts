import { test, expect } from "@playwright/test";

// Quét horizontal overflow — biến criterion "mobile/tablet/desktop không vỡ"
// thành check máy chạy được (exit code). Màn mới khi ổn định → THÊM route vào đây.
// /product/ao-khoac-hoodie-ni: slug seed cố định (products.fixture — HOODIE, có
// giảm giá nên render cả FlashSale strip). Lưu ý hạn chế đã biết: scrollWidth KHÔNG bắt được lỗi
// min-content banh cột bị container clip (đã dính ở flash sale strip) — lớp đó
// verify bằng đo bounding box element trong /qa.
const ROUTES = [
  "/",
  "/collection",
  "/login",
  "/register",
  "/cart",
  "/product/ao-khoac-hoodie-ni",
  "/user/my-account",
  "/user/my-address",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`không horizontal overflow: ${route} @ ${vp.name} ${vp.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      // /user/* qua middleware bằng cookie phiên giả — middleware chỉ check cookie
      // tồn tại; sweep đo overflow nên không cần phiên thật (API 401 vẫn render form)
      if (route.startsWith("/user")) {
        await page.context().addCookies([
          {
            name: "accessToken",
            value: "e2e-sweep",
            domain: "localhost",
            path: "/",
          },
        ]);
      }
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      // +1px dung sai làm tròn subpixel
      expect(
        scrollWidth,
        `trang tràn ngang: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`
      ).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
}
