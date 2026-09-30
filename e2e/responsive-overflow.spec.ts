import { APIRequestContext, test } from "@playwright/test";
import { expectNoHorizontalOverflow, SEED_CUSTOMER } from "./helpers/shop";

// Quét horizontal overflow — biến criterion "mobile/tablet/desktop không vỡ"
// thành check máy chạy được (exit code). Màn mới khi ổn định → THÊM route vào đây.
// /product/ao-khoac-hoodie-ni: slug seed cố định (products.fixture — HOODIE, có
// giảm giá nên render cả FlashSale strip). Lưu ý hạn chế đã biết: scrollWidth KHÔNG bắt được lỗi
// min-content banh cột bị container clip (đã dính ở flash sale strip) — lớp đó
// verify bằng đo bounding box element trong /qa.
const ROUTES = [
  "/",
  "/collection",
  "/collection?search=hood",
  // Trang 404 — StatusScreen + minh họa 150px
  "/trang-khong-ton-tai",
  "/login",
  "/register",
  "/cart",
  "/checkout",
  // /payment-success không có mã đơn hợp lệ → đo ở trạng thái "không tìm thấy đơn";
  // trạng thái đủ 6 khối đo trong guest-checkout.spec.ts sau khi đặt đơn thật
  "/payment-success",
  // Đơn chuyển khoản seed: màn chờ (QR + STK + chip hạn) và màn đã hủy (E2 + CTA đặt lại);
  // trạng thái "đã nhận" đo trong bank-transfer.spec.ts sau khi admin set paid thật
  "/payment-success?orderNumber=ORD-SEEDBANKPENDNG23",
  "/payment-success?orderNumber=ORD-SEEDCANCELLED234",
  "/product/ao-khoac-hoodie-ni",
  "/user/my-account",
  "/user/my-address",
  "/user/orders",
  // Đơn seed cố định (orders.fixture — ORD_1, status shipped) để trang chi tiết đo được
  // bố cục thật: stepper + 2 khối thông tin + bảng sản phẩm
  "/user/orders/ORD-SEEDSHPPED234567",
  // Mã không tồn tại → màn không tìm thấy đơn
  "/user/orders/ORD-KHONGTONTAJ2345",
];

// Phiên thật, đăng nhập MỘT lần cho cả file: cụm /user render nội dung thật (đơn hàng,
// địa chỉ của seed customer) mới đo được bố cục — cookie giả chỉ qua được middleware rồi
// dừng ở trạng thái lỗi, không có gì để đo. Cache token vì auth có rate limit.
let tokenPromise: Promise<string> | undefined;

async function sessionCookies(request: APIRequestContext) {
  tokenPromise ??= request
    .post("http://localhost:3009/api/v1/auth/login", { data: SEED_CUSTOMER })
    .then(async (res) => {
      const body = await res.json();
      const token = body?.data?.accessToken;
      if (!token)
        throw new Error(`Login seed customer thất bại: ${res.status()}`);
      return token as string;
    })
    // KHÔNG giữ promise đã reject: một lần login hỏng sẽ kéo mọi test /user fail cùng lỗi cũ
    .catch((error) => {
      tokenPromise = undefined;
      throw error;
    });

  return [
    {
      name: "accessToken",
      value: await tokenPromise,
      domain: "localhost",
      path: "/",
    },
  ];
}

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`không horizontal overflow: ${route} @ ${vp.name} ${vp.width}px`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      if (route.startsWith("/user")) {
        await page.context().addCookies(await sessionCookies(request));
      }
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      await expectNoHorizontalOverflow(page);
    });
  }
}

// Trạng thái chỉ có sau tương tác: thanh search mobile mở + panel gợi ý (overlay
// tuyệt đối dưới header) — không phải route nên đo riêng, chỉ ở mobile
test("không horizontal overflow: thanh search mobile mở kèm panel gợi ý @ mobile 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
  await page.getByTestId("mobile-search-bar").getByRole("combobox").fill("áo");
  await page.getByText("Xem tất cả kết quả").waitFor();

  await expectNoHorizontalOverflow(page);
});
