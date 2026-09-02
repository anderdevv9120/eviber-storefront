import { test, expect } from "@playwright/test";
import { HOODIE, selectHoodieVariantAndAddToCart } from "./helpers/shop";

test("cart: tăng số lượng, xóa item qua modal, trạng thái giỏ trống", async ({
  page,
}) => {
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);

  await page.goto("/cart");
  await expect(page.getByText(HOODIE.name).first()).toBeVisible();
  await expect(page.getByTestId("cart-count")).toHaveText(
    "1 sản phẩm trong giỏ"
  );
  // Header render UserAction 2 lần (desktop + mobile) — first() = bản desktop
  await expect(page.getByTestId("cart-badge").first()).toHaveText("1");

  // Counter debounce 1s trước khi PUT update-quantity — expect tự chờ trong timeout
  await page.getByRole("button", { name: "Tăng số lượng" }).first().click();
  await expect(page.getByTestId("cart-count")).toHaveText(
    "2 sản phẩm trong giỏ"
  );
  await expect(page.getByTestId("cart-badge").first()).toHaveText("2");

  await page.getByTestId("cart-item-remove").first().click();
  await expect(page.getByText("Xác nhận xóa")).toBeVisible();
  await page.getByRole("button", { name: "Đồng ý" }).click();

  await expect(page.getByText("Xóa sản phẩm thành công")).toBeVisible();
  await expect(page.getByText("Giỏ hàng đang trống")).toBeVisible();
  // Giỏ trống: không render CTA Thanh toán, badge Header ẩn
  await expect(page.getByRole("button", { name: "Thanh toán" })).toHaveCount(0);
  await expect(page.getByTestId("cart-badge")).toHaveCount(0);
});

// Regression race: pending debounce là single slot — chỉnh item thứ 2 trong cửa
// sổ 1s phải flush update của item trước, không thì server giữ số cũ (sai đơn checkout)
test("cart: chỉnh số lượng 2 item liên tiếp trong 1s — update item trước không bị nuốt", async ({
  page,
}) => {
  await page.goto(HOODIE.url);
  await selectHoodieVariantAndAddToCart(page);
  await page.getByRole("button", { name: "Xám", exact: true }).click();
  await page.getByRole("button", { name: "L", exact: true }).click();
  await expect(page.getByText("Màu sắc: Xám")).toBeVisible();
  await page.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
  await expect(page.getByTestId("cart-badge").first()).toHaveText("2");

  await page.goto("/cart");
  await expect(page.getByTestId("cart-count")).toHaveText(
    "2 sản phẩm trong giỏ"
  );
  const rows = page.getByTestId("cart-item");
  await rows.nth(0).getByRole("button", { name: "Tăng số lượng" }).click();
  await rows.nth(1).getByRole("button", { name: "Tăng số lượng" }).click();

  await expect(page.getByTestId("cart-count")).toHaveText(
    "4 sản phẩm trong giỏ"
  );
  // Đối chiếu số server thật, không tin UI optimistic
  await page.reload();
  await expect(page.getByTestId("cart-count")).toHaveText(
    "4 sản phẩm trong giỏ"
  );
});
