import { test, expect } from "@playwright/test";
import { SEED_CUSTOMER, loginViaUi } from "./helpers/shop";

test("login đúng thông tin → toast thành công, về trang chủ", async ({
  page,
}) => {
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);
});

test("login sai password → hiện lỗi inline, ở lại trang login", async ({
  page,
}) => {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(SEED_CUSTOMER.email);
  await page.locator('input[name="password"]').fill("SaiPassword@123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

  // Lỗi inline đã map tiếng Việt (getByRole("alert") không dùng được —
  // route announcer của Next cũng mang role=alert gây strict violation)
  await expect(page.getByText("Email hoặc mật khẩu không đúng")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("guest bootstrap clears stale profile without protected auth requests", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "app",
      JSON.stringify({
        state: {
          profile: {
            _id: "stale-profile",
            email: "old@example.test",
            phone: "",
            status: "",
            firstName: "Old",
            lastName: "Session",
          },
        },
        version: 0,
      })
    );
  });
  const protectedRequests: string[] = [];
  page.on("request", (request) => {
    if (
      /\/auth\/profile(?:\?|$)|\/api\/auth\/refresh(?:\?|$)/.test(request.url())
    )
      protectedRequests.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("app") ?? "null")?.state.profile._id
      )
    )
    .toBe("");
  expect(protectedRequests).toEqual([]);
});

test("refresh-only session restores the profile and rotates private cookies", async ({
  page,
  context,
}) => {
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("app") ?? "null")?.state.profile.email
      )
    )
    .toBe(SEED_CUSTOMER.email);
  const refreshBefore = (await context.cookies()).find(
    (cookie) => cookie.name === "refreshToken"
  )!;
  expect(refreshBefore.httpOnly).toBe(true);
  await context.clearCookies({ name: "accessToken" });
  await page.evaluate(() => localStorage.removeItem("app"));
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/refresh") &&
        response.status() === 200
    ),
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/auth/profile") &&
        response.status() === 200
    ),
    page.reload(),
  ]);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("app") ?? "null")?.state.profile.email
      )
    )
    .toBe(SEED_CUSTOMER.email);
  const restoredCookies = await context.cookies();
  expect(
    restoredCookies.find((cookie) => cookie.name === "accessToken")
  ).toMatchObject({ value: expect.stringMatching(/.+/) });
  const refreshAfter = restoredCookies.find(
    (cookie) => cookie.name === "refreshToken"
  )!;
  expect(refreshAfter.httpOnly).toBe(true);
  expect(refreshAfter.value).not.toBe(refreshBefore.value);
});

test("logout clears session hint and subsequent guest visits skip auth probes", async ({
  page,
  context,
}) => {
  await loginViaUi(page, SEED_CUSTOMER.email, SEED_CUSTOMER.password);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("app") ?? "null")?.state.profile.email
      )
    )
    .toBe(SEED_CUSTOMER.email);
  await page.getByRole("button", { name: "Tài khoản", exact: true }).click();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (await context.cookies()).filter((cookie) =>
      ["accessToken", "refreshToken"].includes(cookie.name)
    )
  ).toEqual([]);
  const session = await page.request.get("/api/auth");
  expect(session.status()).toBe(200);
  expect(await session.json()).toEqual({ hasSession: false });
  const protectedRequests: string[] = [];
  page.on("request", (request) => {
    if (
      /\/auth\/profile(?:\?|$)|\/api\/auth\/refresh(?:\?|$)/.test(request.url())
    )
      protectedRequests.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(protectedRequests).toEqual([]);
});
