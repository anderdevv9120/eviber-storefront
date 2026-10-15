import { test, expect, Page } from "@playwright/test";
import { HOODIE } from "./helpers/shop";

// Header Rosier (theme mặc định) không có ô search inline ở desktop: mọi breakpoint
// đều bấm kính lúp mở thanh search; submit đóng thanh, mở lại thì ô giữ từ khóa từ URL
const openSearch = async (page: Page) => {
  await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
  return page
    .getByTestId("mobile-search-bar")
    .getByRole("combobox", { name: "Tìm kiếm sản phẩm" });
};
const closeSearch = (page: Page) =>
  page.getByRole("button", { name: "Đóng tìm kiếm" }).click();

test("search desktop: gợi ý typeahead → Enter về collection có chip từ khóa", async ({
  page,
}) => {
  await page.goto("/");

  const input = await openSearch(page);
  await input.fill("hood");
  // Panel gợi ý hiện sản phẩm seed có "hood" trong tên, phần khớp được highlight
  const listbox = page.getByRole("listbox", { name: "Gợi ý sản phẩm" });
  await expect(listbox).toBeVisible();
  await expect(
    listbox.getByRole("option", { name: new RegExp(HOODIE.name) })
  ).toBeVisible();

  await input.press("Enter");
  await expect(page).toHaveURL(/\/collection\?search=hood$/);
  await expect(page).toHaveTitle(/Kết quả cho “hood”/);
  await expect(listbox).toHaveCount(0);

  // Chip từ khóa + ô search giữ từ khóa; grid chỉ còn sản phẩm khớp
  await expect(
    page.getByRole("button", { name: "Bỏ lọc Từ khóa: hood" })
  ).toBeVisible();
  await expect(await openSearch(page)).toHaveValue("hood");
  await closeSearch(page);
  await expect(page.getByRole("heading", { name: HOODIE.name })).toBeVisible();

  // Đổi sort vẫn giữ từ khóa trên URL
  await page.getByRole("button", { name: "Bán chạy" }).first().click();
  await expect(page).toHaveURL(/search=hood/);
  await expect(page).toHaveURL(/sort=bestseller/);

  // Bỏ chip → URL sạch, ô search trống
  await page.getByRole("button", { name: "Bỏ lọc Từ khóa: hood" }).click();
  await expect(page).not.toHaveURL(/search=/);
  await expect(await openSearch(page)).toHaveValue("");
});

test("search desktop: từ khóa không khớp → empty state nêu từ khóa", async ({
  page,
}) => {
  await page.goto("/");
  const input = await openSearch(page);
  await input.fill("zzzz-khong-co");
  await expect(
    page.getByText("Không có sản phẩm nào cho “zzzz-khong-co”")
  ).toBeVisible();

  await input.press("Enter");
  await expect(page).toHaveURL(/search=zzzz-khong-co/);
  await expect(
    page.getByText("Không tìm thấy sản phẩm nào cho “zzzz-khong-co”")
  ).toBeVisible();
});

test("search mobile: kính lúp mở thanh trượt, submit đóng thanh và về collection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
  const bar = page.getByTestId("mobile-search-bar");
  await expect(bar).toBeVisible();
  const input = bar.getByRole("combobox", { name: "Tìm kiếm sản phẩm" });
  await expect(input).toBeFocused();

  await input.fill("hood");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/collection\?search=hood$/);
  await expect(bar).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Bỏ lọc Từ khóa: hood" })
  ).toBeVisible();
});
