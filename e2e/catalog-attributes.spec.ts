import { test, expect, APIRequestContext, Page } from "@playwright/test";
import type { IProductDetailResponse } from "../src/@types/Product.type";
import {
  HOODIE,
  selectHoodieVariantAndAddToCart,
  goToCheckoutFromCart,
  fillShippingForm,
  expectNoHorizontalOverflow,
} from "./helpers/shop";

const STOREFRONT = "http://localhost:3009/api/v1";
const ADMIN = process.env.E2E_ADMIN_API ?? "http://localhost:8011/admin/v1";

interface Dictionary {
  attribute: { _id: string; name: string; revision: number };
  revision: number;
  values: { _id: string; value: string; meta: string | null }[];
}

// Assert the real HTTP status before unwrapping exactly one API envelope.
async function api<T>(
  request: APIRequestContext,
  method: "get" | "post" | "patch" | "put" | "delete",
  url: string,
  token?: string,
  data?: object,
  status = 200
): Promise<T> {
  const response = await request[method](url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    data,
  });
  expect(
    response.status(),
    `${method.toUpperCase()} ${url}: ${await response.text()}`
  ).toBe(status);
  return (await response.json()).data as T;
}

async function adminLogin(request: APIRequestContext) {
  const result = await api<{ accessToken: string }>(
    request,
    "post",
    `${ADMIN}/auth/login`,
    undefined,
    { email: "admin@demo.local", password: "Demo@123" }
  );
  expect(result.accessToken).toEqual(expect.any(String));
  return result.accessToken;
}

test("dictionary: saved S/M/L/XL order and hex/text survive public reload", async ({
  request,
}) => {
  const token = await adminLogin(request);
  const parent = await api<{ _id: string }>(
    request,
    "post",
    `${ADMIN}/attributes`,
    token,
    {
      code: `e2e_size_${Date.now()}`,
      name: "E2E Size",
    },
    201
  );
  const url = `${ADMIN}/attributes/${parent._id}`;
  try {
    const ids = new Map<string, string>();
    let revision = 0;
    for (const value of ["XL", "M", "S", "L"]) {
      const created = await api<{ value: { _id: string }; revision: number }>(
        request,
        "post",
        `${url}/values`,
        token,
        {
          value,
          expectedRevision: revision,
          ...(value === "M" ? { meta: "#abc" } : {}),
        },
        201
      );
      ids.set(value, created.value._id);
      revision = created.revision;
    }
    const valueIds = ["S", "M", "L", "XL"].map((value) => ids.get(value));
    await api(request, "put", `${url}/values/order`, token, {
      valueIds,
      expectedRevision: revision,
    });
    // Two independent reads establish persistence, rather than inspecting the save response.
    for (let read = 0; read < 2; read++) {
      const values = await api<Dictionary["values"]>(
        request,
        "get",
        `${STOREFRONT}/attributes/${parent._id}/values`
      );
      expect(values.map((value) => value._id)).toEqual(valueIds);
      expect(values.map((value) => value.value)).toEqual(["S", "M", "L", "XL"]);
      expect(values.map((value) => value.meta)).toEqual([
        null,
        "#AABBCC",
        null,
        null,
      ]);
      for (const value of values)
        expect(value).not.toHaveProperty("normalizedValue");
    }
    const current = await api<Dictionary>(
      request,
      "get",
      `${url}/values`,
      token
    );
    await api(request, "patch", `${url}/values/${ids.get("M")}`, token, {
      value: "M",
      meta: null,
      expectedRevision: current.revision,
    });
    const cleared = await api<Dictionary["values"]>(
      request,
      "get",
      `${STOREFRONT}/attributes/${parent._id}/values`
    );
    expect(cleared.map((value) => value.meta)).toEqual([
      null,
      null,
      null,
      null,
    ]);
  } finally {
    const current = await api<Dictionary>(
      request,
      "get",
      `${url}/values`,
      token
    );
    const deleted = await api<{ _id: string; removedValueCount: number }>(
      request,
      "delete",
      `${url}?expectedRevision=${current.revision}`,
      token
    );
    expect(deleted).toEqual({
      _id: parent._id,
      removedValueCount: current.values.length,
    });
  }
});

function identity(product: IProductDetailResponse) {
  return {
    options: product.options.map((option) => ({
      attributeId: option.attributeId._id,
      optionValues: option.optionValues,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      values: variant.attributeValues.map((value) => value._id),
    })),
  };
}

async function purchase(page: Page, request: APIRequestContext, token: string) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await goToCheckoutFromCart(page);
  await fillShippingForm(page, "catalog-e2e@demo.local");
  await page.setViewportSize({ width: 375, height: 812 });
  await expectNoHorizontalOverflow(page);
  const response = page.waitForResponse(
    (res) =>
      res.url() === `${STOREFRONT}/orders` && res.request().method() === "POST"
  );
  await page
    .getByTestId("checkout-sticky-bar")
    .getByRole("button", { name: "Đặt hàng", exact: true })
    .click();
  await page.waitForURL(/\/payment-success/);
  await expect(
    page.getByRole("heading", { name: "Đã nhận đơn của bạn" })
  ).toBeVisible();
  await expect(page.getByTestId("success-shipping")).toContainText(
    "Nguyễn Văn E2E"
  );
  await expectNoHorizontalOverflow(page);
  const created = await response;
  expect(created.status()).toBe(201);
  const order = (await created.json()).data;
  return api<{
    _id: string;
    productInfo: {
      variantId: string;
      attributeValuesAtOrder: { name: string; value: string }[];
    }[];
  }>(request, "get", `${ADMIN}/orders/${order._id}`, token);
}

test("shared labels: fresh variant selection/checkout changes while the first purchased snapshot and identities stay unchanged", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const token = await adminLogin(request);
  const productUrl = `${STOREFRONT}/products/by-slug/ao-khoac-hoodie-ni`;
  const before = await api<IProductDetailResponse>(request, "get", productUrl);
  const size = before.options.find(
    (option) => option.attributeId.code === "size"
  );
  const selected = before.variants.find(
    (variant) =>
      variant.attributeValues.some((value) => value.value === "Đen") &&
      variant.attributeValues.some((value) => value.value === "M")
  );
  if (!size || !selected)
    throw new Error(
      "Seed hoodie must have Size and the Đen/M purchasable variant"
    );
  const medium = selected.attributeValues.find(
    (value) => value.attributeId === size.attributeId._id
  );
  if (!medium) throw new Error("Selected variant must reference a Size value");
  const url = `${ADMIN}/attributes/${size.attributeId._id}`;
  const original = await api<Dictionary>(
    request,
    "get",
    `${url}/values`,
    token
  );
  const newName = "Kích cỡ E2E";
  const newValue = "Medium E2E";
  let changed = false;
  try {
    await page.goto(HOODIE.url);
    const black = page.getByRole("button", { name: "Đen", exact: true });
    const blackMeta = selected.attributeValues.find(
      (value) => value.value === "Đen"
    )?.meta;
    if (!blackMeta || !/^#[0-9a-f]{6}$/i.test(blackMeta))
      throw new Error("Seed Đen value must carry a six-digit hex swatch");
    const rgb = [1, 3, 5].map((start) =>
      Number.parseInt(blackMeta.slice(start, start + 2), 16)
    );
    await expect(black).toHaveCSS("background-color", `rgb(${rgb.join(", ")})`);
    await page.setViewportSize({ width: 375, height: 812 });
    await expectNoHorizontalOverflow(page);
    await selectHoodieVariantAndAddToCart(page);
    const purchased = await purchase(page, request, token);
    expect(purchased.productInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variantId: selected.id,
          attributeValuesAtOrder: expect.arrayContaining([
            { name: original.attribute.name, value: medium.value },
          ]),
        }),
      ])
    );
    const purchasedBytes = JSON.stringify(purchased);
    changed = true;
    await api(request, "patch", url, token, {
      name: newName,
      expectedRevision: original.revision,
    });
    let current = await api<Dictionary>(request, "get", `${url}/values`, token);
    await api(request, "patch", `${url}/values/${medium._id}`, token, {
      value: newValue,
      expectedRevision: current.revision,
    });
    current = await api<Dictionary>(request, "get", `${url}/values`, token);
    await api(request, "put", `${url}/values/order`, token, {
      valueIds: current.values.map((value) => value._id).reverse(),
      expectedRevision: current.revision,
    });

    const after = await api<IProductDetailResponse>(request, "get", productUrl);
    expect(identity(after)).toEqual(identity(before));
    expect(
      after.options.find(
        (option) => option.attributeId._id === size.attributeId._id
      )?.attributeId.name
    ).toBe(newName);
    expect(
      after.variants
        .find((variant) => variant.id === selected.id)
        ?.attributeValues.find((value) => value._id === medium._id)?.value
    ).toBe(newValue);
    await page.goto(HOODIE.url);
    const groupLabel = page.locator("p").filter({ hasText: newName });
    await expect(groupLabel).toHaveText(new RegExp(`^${newName}: .+`));
    // Existing product choices keep their own option sequence despite dictionary reversal.
    const labels = size.optionValues
      .map(
        (id) =>
          after.variants
            .flatMap((variant) => variant.attributeValues)
            .find((value) => value._id === id)?.value
      )
      .filter((label): label is string => label !== undefined);
    const choices = groupLabel.locator("..").getByRole("button");
    await expect(choices).toHaveText(labels);
    await expect(
      page.getByRole("button", { name: newValue, exact: true })
    ).toBeEnabled();
    await page.getByRole("button", { name: "Đen", exact: true }).click();
    await page.getByRole("button", { name: newValue, exact: true }).click();
    await expect(
      page.getByText(`${newName}: ${newValue}`, { exact: true })
    ).toBeVisible();
    await page.getByRole("button", { name: "Thêm vào giỏ hàng" }).click();
    await expect(page.getByText("Thêm vào giỏ hàng thành công")).toBeVisible();
    const second = await purchase(page, request, token);
    expect(second.productInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variantId: selected.id,
          attributeValuesAtOrder: expect.arrayContaining([
            { name: newName, value: newValue },
          ]),
        }),
      ])
    );
    expect(
      JSON.stringify(
        await api(request, "get", `${ADMIN}/orders/${purchased._id}`, token)
      )
    ).toBe(purchasedBytes);
    await expectNoHorizontalOverflow(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  } finally {
    if (changed) {
      let current = await api<Dictionary>(
        request,
        "get",
        `${url}/values`,
        token
      );
      await api(request, "patch", url, token, {
        name: original.attribute.name,
        expectedRevision: current.revision,
      });
      current = await api<Dictionary>(request, "get", `${url}/values`, token);
      await api(request, "patch", `${url}/values/${medium._id}`, token, {
        value: medium.value,
        expectedRevision: current.revision,
      });
      current = await api<Dictionary>(request, "get", `${url}/values`, token);
      await api(request, "put", `${url}/values/order`, token, {
        valueIds: original.values.map((value) => value._id),
        expectedRevision: current.revision,
      });
      expect(
        identity(await api<IProductDetailResponse>(request, "get", productUrl))
      ).toEqual(identity(before));
    }
  }
});
