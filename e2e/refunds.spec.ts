import {
  APIRequestContext,
  APIResponse,
  expect,
  Page,
  PlaywrightWorkerArgs,
  test,
} from "@playwright/test";
import { randomUUID } from "crypto";
import { createRequire } from "module";
import path from "path";
import { expectNoHorizontalOverflow } from "./helpers/shop";
import {
  capturedMails,
  refundAccessMailCount,
  waitForRefundAccessUrl,
} from "./helpers/refund-mailbox";

// Acceptance against the isolated harness (playwright.refunds.config.ts): every scenario builds
// its own orders through the real checkout API, drives customers through the real storefront UI
// and staff through the real admin API, then asserts persisted balances and stock movements.
const API = process.env.REFUND_E2E_API!;
const ADMIN_API = process.env.REFUND_E2E_ADMIN_API!;
const MONGO_URI = process.env.REFUND_E2E_MONGO_URI!;
const PASSWORD = "Demo@123";
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64"
);

const backendRequire = createRequire(
  path.resolve(__dirname, "../../backend/package.json")
);
const { MongoClient, ObjectId } = backendRequire("mongodb");

type Json = any; // eslint-disable-line -- API envelopes are asserted field by field below

async function data(response: APIResponse): Promise<Json> {
  if (!response.ok())
    throw new Error(
      `${response.url()} → ${response.status()} ${await response.text()}`
    );
  return (await response.json()).data;
}

// Fixture setup and balance inspection talk to the harness's temporary database only.
let mongo: InstanceType<typeof MongoClient>;
const db = () => mongo.db();

test.beforeAll(async () => {
  expect(
    new URL(MONGO_URI).port,
    "refund e2e must never touch the live database"
  ).not.toBe("27017");
  mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
});
test.afterAll(async () => {
  await mongo.close();
});

async function login(
  request: APIRequestContext,
  base: string,
  email: string
): Promise<string> {
  const res = await request.post(`${base}/auth/login`, {
    data: { email, password: PASSWORD },
  });
  return (await data(res)).accessToken;
}

function staffClient(request: APIRequestContext, token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  return {
    get: async (url: string) =>
      data(await request.get(`${ADMIN_API}${url}`, { headers })),
    post: async (url: string, body: object) =>
      data(await request.post(`${ADMIN_API}${url}`, { headers, data: body })),
    patch: async (url: string, body: object) =>
      data(await request.patch(`${ADMIN_API}${url}`, { headers, data: body })),
    raw: (method: "get" | "post" | "patch", url: string, body?: object) =>
      request[method](`${ADMIN_API}${url}`, { headers, data: body }),
  };
}

let adminTokenCache: string | undefined;
async function admin(request: APIRequestContext) {
  adminTokenCache ??= await login(request, ADMIN_API, "admin@demo.local");
  return staffClient(request, adminTokenCache);
}

/** A second ADMIN account (clone of the seeded one) in the isolated database only. */
async function secondAdmin(request: APIRequestContext) {
  const users = db().collection("users");
  if (!(await users.findOne({ email: "admin2@demo.local" }))) {
    const { _id, email, phoneNumber, sessions, adminSessions, ...rest } =
      (await users.findOne({ email: "admin@demo.local" }))!;
    (void _id, email, phoneNumber, sessions, adminSessions);
    await users.insertOne({
      ...rest,
      _id: new ObjectId(),
      email: "admin2@demo.local",
    });
  }
  return staffClient(
    request,
    await login(request, ADMIN_API, "admin2@demo.local")
  );
}

async function uploadEvidence(
  request: APIRequestContext,
  token: string,
  orderNumber: string
): Promise<string> {
  const res = await request.post(
    `${API}/orders/${orderNumber}/refund-evidence`,
    {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        image: {
          name: "evidence.png",
          mimeType: "image/png",
          buffer: ONE_PIXEL_PNG,
        },
      },
    }
  );
  return (await data(res)).evidenceId;
}

type Staff = ReturnType<typeof staffClient>;

// Seed catalog: choose purchasable variants once, then top their stock up so earlier scenarios
// cannot starve later ones. Never hard-code generated ids.
const picked: { productId: string; variantId: string; price: number }[] = [];
async function variantsWithStock(count: number) {
  if (picked.length < 4) {
    const found = await db()
      .collection("productvariants")
      .aggregate([
        { $match: { inventoryCount: { $gte: 30 } } },
        {
          $group: {
            _id: "$productId",
            variantId: { $first: "$_id" },
            price: { $first: "$price" },
          },
        },
        { $limit: 4 },
      ])
      .toArray();
    picked.push(
      ...found.map((v: Json) => ({
        productId: v._id.toString(),
        variantId: v.variantId.toString(),
        price: v.price,
      }))
    );
  }
  expect(picked.length).toBeGreaterThanOrEqual(count);
  const chosen = picked.slice(0, count);
  await db()
    .collection("productvariants")
    .updateMany(
      { _id: { $in: chosen.map((v) => new ObjectId(v.variantId)) } },
      { $set: { inventoryCount: 500 } }
    );
  return chosen;
}

const stock = async (variantId: string) =>
  (await db()
    .collection("productvariants")
    .findOne({ _id: new ObjectId(variantId) }))!.inventoryCount as number;
const movementCount = async (variantId: string) =>
  db()
    .collection("stockmovements")
    .countDocuments({ variantId: new ObjectId(variantId) });

type PurchaseLine = { variantId: string; quantity: number };
type PurchaseCombo = {
  comboId: string;
  quantity: number;
  picks: { productId: string; variantId: string }[];
};
type Purchase = {
  lines?: PurchaseLine[];
  combos?: PurchaseCombo[];
  email: string;
  customer?: "customer1@demo.local" | "customer2@demo.local";
  /** Checkout currently hard-codes shipping 0, so fee fixtures patch the isolated order before its receipt. */
  shippingFee?: number;
};
type Bought = {
  orderId: string;
  orderNumber: string;
  token?: string;
  email: string;
};

/** Real cart → checkout-review → order, then staff confirm/ship/deliver and record the receipt. */
async function buy(
  playwright: PlaywrightWorkerArgs["playwright"],
  staff: Staff,
  purchase: Purchase
): Promise<Bought> {
  const request = await playwright.request.newContext(); // own cookie jar = own guest session
  const token = purchase.customer
    ? await login(request, API, purchase.customer)
    : undefined;
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const call = async (
    method: "get" | "post" | "put" | "delete",
    url: string,
    body?: object
  ) => data(await request[method](`${API}${url}`, { headers, data: body }));

  if (token) {
    const cart = await call("get", "/carts");
    for (const item of cart.items ?? [])
      await call("delete", "/carts/remove-from-cart", {
        variantId: item.variantId,
      });
    for (const line of cart.combos ?? [])
      await call("delete", "/carts/combos", { lineId: line.lineId ?? line.id });
  }
  let cartId = "";
  for (const line of purchase.lines ?? []) {
    cartId = (await call("post", "/carts/add-to-cart", line)).cartId;
  }
  for (const combo of purchase.combos ?? [])
    cartId = (await call("post", "/carts/combos", combo)).cartId;

  const review = await call("get", `/orders/checkout-review/${cartId}`);
  const order = await call("post", "/orders", {
    cartId,
    shippingInfo: {
      name: "Khách Hoàn Tiền",
      phoneNumber: "0900123456",
      email: purchase.email,
      city: "Hà Nội",
      ward: "Dịch Vọng",
      specificAddress: "Số 9 Trần Thái Tông",
    },
    expectedTotalPrice: review.totalPrice,
    expectedRefundTerms: review.refundTerms,
    expectedCartItems: review.products.map((p: Json) => ({
      variantId: p.variantId,
      quantity: p.quantity,
    })),
    expectedComboItems: review.combos.map((c: Json) => ({
      comboId: c.comboId,
      quantity: c.quantity,
      picks: c.picks.map((p: Json) => ({
        productId: p.productId,
        variantId: p.variantId,
      })),
    })),
  });
  await request.dispose();

  const id = order._id;
  if (purchase.shippingFee) {
    await db()
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { "checkoutInfo.totalPrice": purchase.shippingFee },
          $set: {
            "checkoutInfo.shippingFee": purchase.shippingFee,
            "refundSnapshot.shippingAmount": purchase.shippingFee,
          },
        }
      );
  }
  await staff.patch(`/orders/${id}/payment-status`, {
    paymentStatus: "paid",
    note: "e2e receipt",
    reference: `E2E-${id}`,
  });
  for (const status of ["confirmed", "shipped", "delivered"])
    await staff.patch(`/orders/${id}/status`, { status });
  return {
    orderId: id,
    orderNumber: order.orderNumber,
    token,
    email: purchase.email,
  };
}

/** A published combo whose first item is chosen by the buyer and whose second is locked. */
async function publishCombo(
  chooseVariantId: string,
  choose: string,
  locked: { productId: string; variantId: string }
) {
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    name: `Combo hoàn tiền ${randomUUID().slice(0, 6)}`,
    slug: `combo-hoan-tien-${randomUUID().slice(0, 8)}`,
    status: "PUBLISH",
    description: null,
    images: [],
    categoryIds: [],
    seo: {},
    items: [
      { productId: new ObjectId(choose), quantity: 1, mode: "CHOOSE" },
      {
        productId: new ObjectId(locked.productId),
        quantity: 1,
        mode: "LOCKED",
        variantId: new ObjectId(locked.variantId),
      },
    ],
    pricing: { mode: "PERCENT", value: 20 },
    soldCount: 0,
    revision: 0,
    created_at: now,
    updated_at: now,
  };
  await db().collection("combos").insertOne(doc);
  return { comboId: doc._id.toString(), chooseVariantId };
}

const refundView = (staff: Staff, orderId: string) =>
  staff.get(`/orders/${orderId}/refunds`);

async function openCustomerOrder(
  page: Page,
  request: APIRequestContext,
  email: string,
  orderNumber: string
) {
  const token = await login(request, API, email);
  await page
    .context()
    .addCookies([
      { name: "accessToken", value: token, domain: "localhost", path: "/" },
    ]);
  await page.goto(`/user/orders/${orderNumber}`);
  await expect(
    page.getByRole("heading", { name: "Hoàn tiền", exact: true })
  ).toBeVisible();
}

/** Selects one purchase row (the fieldset legend names the product) and fills its details. */
async function fillRefundRow(
  page: Page,
  product: string | RegExp,
  form: {
    reason?: string;
    quantity?: number;
    explanation: string;
    evidence?: boolean;
  },
  position = 0
) {
  const group = page.getByRole("group", { name: product });
  const checkbox = group.getByRole("checkbox").nth(position);
  await checkbox.check();
  const row = checkbox.locator(
    "xpath=ancestor::div[contains(@class,'border-t')][1]"
  );
  if (form.quantity)
    await row.getByLabel("Số lượng").selectOption(String(form.quantity));
  if (form.reason)
    await row.getByLabel("Lý do").selectOption({ label: form.reason });
  await row.getByLabel("Mô tả vấn đề").fill(form.explanation);
  if (form.evidence) {
    await row.locator('input[type="file"]').setInputFiles({
      name: "evidence.png",
      mimeType: "image/png",
      buffer: ONE_PIXEL_PNG,
    });
    await expect(row.getByText("evidence.png")).toBeVisible();
  }
}

const sendRefundForm = (page: Page) =>
  page.getByRole("button", { name: "Gửi yêu cầu hoàn tiền" }).click();

const seen: Record<"evidence" | "partial" | "guest" | "shipping", Bought> =
  {} as never; // orders the inspection test revisits

type Allocation = {
  allocationId: string;
  productInfoIndex: number;
  productName: string;
  netAmount: number;
  availableQuantity: number;
};

const orderDoc = (orderId: string) =>
  db()
    .collection("orders")
    .findOne({ _id: new ObjectId(orderId) });
const variantOf = async (orderId: string, productInfoIndex: number) =>
  (
    (await orderDoc(orderId))!.productInfo[productInfoIndex]
      .variantId as InstanceType<typeof ObjectId>
  ).toString();
const restockMovements = (requestId: string) =>
  db()
    .collection("stockmovements")
    .countDocuments({ refundRequestId: new ObjectId(requestId) });

const decide = (
  staff: Staff,
  orderId: string,
  requestId: string,
  view: Json,
  items: Json[],
  extra: { shippingAmount?: number } = {}
) =>
  staff.post(`/orders/${orderId}/refunds/${requestId}/decision`, {
    idempotencyKey: randomUUID(),
    expectedRevision: view.revision,
    items,
    shippingAmount: extra.shippingAmount ?? 0,
    customerMessage: "Yêu cầu của bạn đã được duyệt",
  });

const inspect = (
  staff: Staff,
  orderId: string,
  requestId: string,
  view: Json,
  items: Json[],
  key = randomUUID()
) =>
  staff.post(`/orders/${orderId}/refunds/${requestId}/inspections`, {
    idempotencyKey: key,
    expectedRevision: view.revision,
    items,
    note: "Đã kiểm tra hàng trả",
  });

const claimPayout = (
  staff: Staff,
  orderId: string,
  requestId: string,
  view: Json,
  key = randomUUID()
) =>
  staff.post(`/orders/${orderId}/refunds/${requestId}/payout-claim`, {
    idempotencyKey: key,
    expectedRevision: view.revision,
  });

const recordPayout = (
  staff: Staff,
  orderId: string,
  requestId: string,
  claimed: Json,
  amount: number,
  reference: string,
  key = randomUUID()
) =>
  staff.post(`/orders/${orderId}/refunds/${requestId}/payout`, {
    idempotencyKey: key,
    expectedRevision: claimed.revision,
    claimId: claimed.requests.find((r: Json) => r.requestId === requestId).claim
      .claimId,
    amount,
    paidAt: new Date().toISOString(),
    reference,
  });

/** Customer-side API submission, used where the UI is not the point of the scenario. */
async function customerSubmit(
  request: APIRequestContext,
  token: string,
  orderNumber: string,
  items: Json[]
) {
  return request.post(`${API}/orders/${orderNumber}/refunds`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { idempotencyKey: randomUUID(), items },
  });
}
const line = (allocationId: string, quantity: number, extra: Json = {}) => ({
  allocationId,
  quantity,
  reason: "ordinary",
  explanation: "Không còn nhu cầu",
  requestedReturn: "return",
  evidenceIds: [],
  ...extra,
});

test.describe.configure({ mode: "serial" });

test("harness_is_isolated", async ({ request, page }) => {
  expect(process.env.REFUND_E2E_MONGO_URI).not.toContain(":27017");
  expect((await request.get(`${API}/products`)).ok()).toBe(true);
  await page.goto("/");
  await expect(page).toHaveURL(/localhost:3130/);
  expect(capturedMails().length).toBeGreaterThanOrEqual(0);
  void refundAccessMailCount;
  void waitForRefundAccessUrl;
});

test("registered_partial_combo_refund_keeps_retained_discount", async ({
  page,
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [a, b] = await variantsWithStock(2);
  const combo = await publishCombo(a.variantId, a.productId, b);
  const order = await buy(playwright, staff, {
    customer: "customer1@demo.local",
    email: "customer1@demo.local",
    combos: [
      {
        comboId: combo.comboId,
        quantity: 1,
        picks: [
          { productId: a.productId, variantId: a.variantId },
          { productId: b.productId, variantId: b.variantId },
        ],
      },
    ],
  });
  const before = await refundView(staff, order.orderId);
  expect(before.allocations).toHaveLength(2);
  const first: Allocation = before.allocations[0];
  const retainedBefore: Allocation = before.allocations[1];
  const totalNet = before.allocations.reduce(
    (sum: number, row: Allocation) => sum + row.netAmount,
    0
  );
  expect(totalNet, "combo discount is frozen at purchase").toBeLessThan(
    a.price + b.price
  );
  const refundedVariant = await variantOf(
    order.orderId,
    first.productInfoIndex
  );
  const retainedVariant = await variantOf(
    order.orderId,
    retainedBefore.productInfoIndex
  );
  const [stockBefore, retainedStockBefore] = [
    await stock(refundedVariant),
    await stock(retainedVariant),
  ];

  await openCustomerOrder(page, request, order.email, order.orderNumber);
  await fillRefundRow(page, first.productName, {
    explanation: "Muốn trả riêng một món trong combo",
  });
  await sendRefundForm(page);
  await expect(page.getByText(/đang yêu cầu 1/)).toBeVisible();

  let view = await refundView(staff, order.orderId);
  const requestId = view.requests[0].requestId;
  expect(view.requests[0].items).toHaveLength(1);
  view = await decide(staff, order.orderId, requestId, view, [
    {
      allocationId: first.allocationId,
      approvedQuantity: 1,
      returnRequired: true,
      reason: "Chấp nhận trả một món",
    },
  ]);
  view = await inspect(staff, order.orderId, requestId, view, [
    {
      allocationId: first.allocationId,
      receivedQuantity: 1,
      sellableQuantity: 1,
      confirmedPurchasedVariant: true,
    },
  ]);
  const claimed = await claimPayout(staff, order.orderId, requestId, view);
  view = await recordPayout(
    staff,
    order.orderId,
    requestId,
    claimed,
    first.netAmount,
    "E2E-COMBO-1"
  );

  expect(view.summary.paidAmount).toBe(first.netAmount);
  expect(view.summary.coverage).toBe("partial");
  const retained = view.allocations.find(
    (row: Allocation) => row.allocationId === retainedBefore.allocationId
  );
  expect(retained.availableQuantity).toBe(1);
  expect(
    retained.netAmount,
    "retained product keeps its original combo discount"
  ).toBe(retainedBefore.netAmount);
  expect(await stock(refundedVariant)).toBe(stockBefore + 1);
  expect(await restockMovements(requestId)).toBe(1);
  expect(await stock(retainedVariant)).toBe(retainedStockBefore);
  await page.reload();
  await expect(page.getByText(/đã hoàn 1/)).toBeVisible();
});

test("three_bought_two_received_one_missing_claims_only_the_missing_unit", async ({
  page,
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const order = await buy(playwright, staff, {
    customer: "customer1@demo.local",
    email: "customer1@demo.local",
    lines: [{ variantId: v.variantId, quantity: 3 }],
  });
  seen.evidence = order;
  const before = await refundView(staff, order.orderId);
  const alloc: Allocation = before.allocations[0];
  const unit = alloc.netAmount / 3;
  expect(Number.isInteger(unit)).toBe(true);
  const stockBefore = await stock(v.variantId);

  await openCustomerOrder(page, request, order.email, order.orderNumber);
  await expect(page.getByText(/đã mua 3 · còn hoàn được 3/)).toBeVisible();
  await fillRefundRow(page, alloc.productName, {
    reason: "Thiếu hàng",
    quantity: 1,
    explanation: "Mở hộp chỉ có 2 sản phẩm",
    evidence: true,
  });
  await expect(
    page.getByText("Hàng thiếu nên không cần gửi trả.")
  ).toBeVisible();
  await sendRefundForm(page);
  await expect(page.getByText(/đang yêu cầu 1/)).toBeVisible();

  let view = await refundView(staff, order.orderId);
  const submitted = view.requests[0];
  expect(submitted.items[0]).toMatchObject({
    quantity: 1,
    reason: "missing_item",
  });
  expect(submitted.items[0].evidenceIds).toHaveLength(1);
  const evidenceId = submitted.items[0].evidenceIds[0];

  // Private evidence image: staff and the owner can read it; anonymous callers and other accounts cannot.
  const evidenceUrl = `${API}/orders/${order.orderNumber}/refund-evidence/${evidenceId}`;
  const owner = await login(request, API, order.email);
  expect(
    (
      await request.get(
        `${ADMIN_API}/orders/${order.orderId}/refund-evidence/${evidenceId}`,
        { headers: { Authorization: `Bearer ${adminTokenCache}` } }
      )
    ).status()
  ).toBe(200);
  expect(
    (
      await request.get(evidenceUrl, {
        headers: { Authorization: `Bearer ${owner}` },
      })
    ).status()
  ).toBe(200);
  expect((await request.get(evidenceUrl)).status()).toBe(401);
  const stranger = await login(request, API, "customer2@demo.local");
  expect(
    (
      await request.get(evidenceUrl, {
        headers: { Authorization: `Bearer ${stranger}` },
      })
    ).status()
  ).toBeGreaterThanOrEqual(403);

  view = await decide(staff, order.orderId, submitted.requestId, view, [
    {
      allocationId: alloc.allocationId,
      approvedQuantity: 1,
      returnRequired: false,
      reason: "Thiếu hàng đã xác nhận",
    },
  ]);
  expect(view.requests[0].stage).toBe("awaiting_payout");
  const claimed = await claimPayout(
    staff,
    order.orderId,
    submitted.requestId,
    view
  );
  view = await recordPayout(
    staff,
    order.orderId,
    submitted.requestId,
    claimed,
    unit,
    "E2E-MISSING-1"
  );

  expect(view.summary.paidAmount).toBe(unit);
  expect(view.allocations[0]).toMatchObject({
    availableQuantity: 2,
    refundedQuantity: 1,
  });
  expect(await stock(v.variantId), "missing goods never restock").toBe(
    stockBefore
  );
  expect(await restockMovements(submitted.requestId)).toBe(0);
});

test("ordinary_return_restocks_only_the_sellable_unit_once", async ({
  page,
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const order = await buy(playwright, staff, {
    customer: "customer1@demo.local",
    email: "customer1@demo.local",
    lines: [{ variantId: v.variantId, quantity: 2 }],
  });
  const alloc: Allocation = (await refundView(staff, order.orderId))
    .allocations[0];
  const stockBefore = await stock(v.variantId);

  await openCustomerOrder(page, request, order.email, order.orderNumber);
  await fillRefundRow(page, alloc.productName, {
    quantity: 2,
    explanation: "Không vừa size",
  });
  await sendRefundForm(page);
  await expect(
    page.getByText(/Hoàn tiền thông thường · yêu cầu 2/)
  ).toBeVisible();

  let view = await refundView(staff, order.orderId);
  const requestId = view.requests[0].requestId;
  view = await decide(staff, order.orderId, requestId, view, [
    {
      allocationId: alloc.allocationId,
      approvedQuantity: 2,
      returnRequired: true,
      reason: "Đồng ý nhận hàng trả",
    },
  ]);
  expect(view.requests[0].stage).toBe("awaiting_return");
  expect(await stock(v.variantId), "approval alone never restocks").toBe(
    stockBefore
  );

  const key = randomUUID();
  const received = [
    {
      allocationId: alloc.allocationId,
      receivedQuantity: 2,
      sellableQuantity: 1,
      confirmedPurchasedVariant: true,
    },
  ];
  view = await inspect(staff, order.orderId, requestId, view, received, key);
  expect(await stock(v.variantId)).toBe(stockBefore + 1);
  const replay = await inspect(
    staff,
    order.orderId,
    requestId,
    view,
    received,
    key
  );
  expect(replay.revision).toBe(view.revision);
  expect(
    await stock(v.variantId),
    "replayed inspection restocks nothing more"
  ).toBe(stockBefore + 1);
  expect(await restockMovements(requestId)).toBe(1);

  const claimed = await claimPayout(staff, order.orderId, requestId, view);
  const approved = claimed.requests[0].approval.amount;
  expect(approved).toBe(alloc.netAmount);
  view = await recordPayout(
    staff,
    order.orderId,
    requestId,
    claimed,
    approved,
    "E2E-RETURN-1"
  );
  expect(view.summary).toMatchObject({
    paidAmount: approved,
    coverage: "full",
  });
  expect(await stock(v.variantId)).toBe(stockBefore + 1);
});

const PRIVATE_KEYS =
  /refundSnapshot|refundAccounting|evidence|tokenHash|sessionToken|internalNote|bankReference|reference|actorName|claim/i;

test("guest_verifies_by_email_link_submits_and_revisits", async ({
  page,
  request,
  playwright,
  browser,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const email = `guest-${randomUUID().slice(0, 8)}@demo.local`;
  const order = await buy(playwright, staff, {
    email,
    lines: [{ variantId: v.variantId, quantity: 1 }],
  });
  seen.guest = order;
  const alloc: Allocation = (await refundView(staff, order.orderId))
    .allocations[0];

  // Knowing the order number alone authorizes nothing, neither in the UI nor on the API.
  expect(
    (await request.get(`${API}/orders/${order.orderNumber}/refunds`)).status()
  ).toBe(401);
  await page.goto(`/refund-access?orderNumber=${order.orderNumber}`);
  await expect(
    page.getByRole("heading", {
      name: `Yêu cầu hoàn tiền cho đơn ${order.orderNumber}`,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Hoàn tiền", exact: true })
  ).toHaveCount(0);

  const mailsBefore = refundAccessMailCount(email);
  await page.getByTestId("refund-access-request").click();
  const link = await waitForRefundAccessUrl(email, mailsBefore);
  expect(link.startsWith("http://localhost:3130/refund-access")).toBe(true);
  for (const mail of capturedMails(email)) {
    expect(`${mail.subject}${mail.text}`).not.toMatch(
      /refund-evidence|admin@demo\.local|internalNote/i
    );
  }

  // The captured mail link is clicked for real: opaque token in the fragment, explicit exchange.
  await page.goto("about:blank"); // the mail opens a fresh document, not a same-page hash change
  await page.goto(link);
  await page.getByTestId("refund-access-verify").click();
  await expect(
    page.getByRole("heading", { name: `Hoàn tiền đơn ${order.orderNumber}` })
  ).toBeVisible();
  expect(page.url()).not.toContain("token=");

  await fillRefundRow(page, alloc.productName, {
    explanation: "Khách vãng lai muốn hoàn tiền",
  });
  await sendRefundForm(page);
  await expect(
    page.getByText(/Hoàn tiền thông thường · yêu cầu 1/)
  ).toBeVisible();
  let view = await refundView(staff, order.orderId);
  expect(view.requests).toHaveLength(1);
  expect(view.requests[0].stage).toBe("awaiting_review");

  // Revisit in the same tab: the order-scoped session survives navigation and shows the history.
  await page.goto(`/refund-access?orderNumber=${order.orderNumber}`);
  await expect(
    page.getByRole("heading", { name: `Hoàn tiền đơn ${order.orderNumber}` })
  ).toBeVisible();
  await expect(
    page.getByText(/Hoàn tiền thông thường · yêu cầu 1/)
  ).toBeVisible();

  // The session is scoped to this order and to this tab.
  const sessionToken = await page.evaluate(
    (n) =>
      JSON.parse(sessionStorage.getItem(`eviber:refund-guest-session:${n}`)!)
        .sessionToken as string,
    order.orderNumber
  );
  const other = await buy(playwright, staff, {
    email: `other-${randomUUID().slice(0, 8)}@demo.local`,
    lines: [{ variantId: v.variantId, quantity: 1 }],
  });
  expect(
    (
      await request.get(`${API}/orders/${other.orderNumber}/refunds`, {
        headers: { "X-Refund-Token": sessionToken },
      })
    ).status()
  ).toBe(401);
  await page.goto(`/refund-access?orderNumber=${other.orderNumber}`);
  await expect(
    page.getByRole("heading", {
      name: `Yêu cầu hoàn tiền cho đơn ${other.orderNumber}`,
    })
  ).toBeVisible();
  const freshTab = await (await browser.newContext()).newPage();
  await freshTab.goto(`/refund-access?orderNumber=${order.orderNumber}`);
  await expect(
    freshTab.getByRole("heading", {
      name: `Yêu cầu hoàn tiền cho đơn ${order.orderNumber}`,
    })
  ).toBeVisible();
  await freshTab.context().close();

  // Expired sessions fail; a logged-in account that merely shares the contact email is not enough either.
  expect(
    (
      await request.get(`${API}/orders/${order.orderNumber}/refunds`, {
        headers: { "X-Refund-Token": sessionToken },
      })
    ).status()
  ).toBe(200);
  await db()
    .collection("refund_guest_sessions")
    .updateMany(
      { orderId: new ObjectId(order.orderId) },
      { $set: { expiresAt: new Date(Date.now() - 1000) } }
    );
  expect(
    (
      await request.get(`${API}/orders/${order.orderNumber}/refunds`, {
        headers: { "X-Refund-Token": sessionToken },
      })
    ).status()
  ).toBe(401);
  const sameEmail = await buy(playwright, staff, {
    email: "customer2@demo.local",
    lines: [{ variantId: v.variantId, quantity: 1 }],
  });
  const customer2 = await login(request, API, "customer2@demo.local");
  expect(
    (
      await request.get(`${API}/orders/${sameEmail.orderNumber}/refunds`, {
        headers: { Authorization: `Bearer ${customer2}` },
      })
    ).ok()
  ).toBe(false);

  // Public lookup stays free of refund internals.
  const lookup = await request.get(`${API}/orders/lookup/${order.orderNumber}`);
  expect(lookup.ok()).toBe(true);
  expect(JSON.stringify(Object.keys((await lookup.json()).data))).not.toMatch(
    PRIVATE_KEYS
  );
  view = await refundView(staff, order.orderId);
  expect(JSON.stringify(view.requests[0].history)).not.toMatch(/token/i);
});

test("excluded_ordinary_product_can_still_be_claimed_as_incorrect", async ({
  page,
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const products = db().collection("products");
  await products.updateOne(
    { _id: new ObjectId(v.productId) },
    { $set: { refundEnabled: false } }
  );
  try {
    const order = await buy(playwright, staff, {
      customer: "customer1@demo.local",
      email: "customer1@demo.local",
      lines: [{ variantId: v.variantId, quantity: 1 }],
    });
    const alloc = (await refundView(staff, order.orderId)).allocations[0];
    expect(alloc.productRefundEnabled).toBe(false);
    // Restore the catalog flag: the order already froze its terms, so later edits change nothing.
    await products.updateOne(
      { _id: new ObjectId(v.productId) },
      { $set: { refundEnabled: true } }
    );

    const token = await login(request, API, order.email);
    const ordinary = await customerSubmit(request, token, order.orderNumber, [
      line(alloc.allocationId, 1),
    ]);
    expect(ordinary.status()).toBeGreaterThanOrEqual(400);
    expect(ordinary.status()).toBeLessThan(500);

    await openCustomerOrder(page, request, order.email, order.orderNumber);
    await page
      .getByRole("group", { name: alloc.productName })
      .getByRole("checkbox")
      .check();
    const reasons = page
      .getByRole("group", { name: alloc.productName })
      .getByLabel("Lý do")
      .locator("option");
    await expect(reasons).toHaveText(["Thiếu hàng", "Nhận sai sản phẩm"]);
    await fillRefundRow(page, alloc.productName, {
      reason: "Nhận sai sản phẩm",
      explanation: "Giao nhầm mẫu",
      evidence: true,
    });
    await sendRefundForm(page);
    await expect(page.getByText(/Nhận sai sản phẩm · yêu cầu 1/)).toBeVisible();

    let view = await refundView(staff, order.orderId);
    const requestId = view.requests[0].requestId;
    view = await decide(staff, order.orderId, requestId, view, [
      {
        allocationId: alloc.allocationId,
        approvedQuantity: 1,
        returnRequired: true,
        reason: "Giao sai mẫu",
      },
    ]);
    expect(view.requests[0].stage).toBe("awaiting_return");
    expect(view.summary.paidAmount).toBe(0);
  } finally {
    await products.updateOne(
      { _id: new ObjectId(v.productId) },
      { $set: { refundEnabled: true } }
    );
  }
});

test("partially_refunded_order_with_active_request_resists_legacy_paths", async ({
  page,
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const order = await buy(playwright, staff, {
    customer: "customer1@demo.local",
    email: "customer1@demo.local",
    lines: [{ variantId: v.variantId, quantity: 4 }],
  });
  seen.partial = order;
  const token = await login(request, API, order.email);
  let view = await refundView(staff, order.orderId);
  const alloc: Allocation = view.allocations[0];
  const unit = alloc.netAmount / 4;

  // Request 1 is paid out; request 2 stays active.
  expect(
    (
      await customerSubmit(request, token, order.orderNumber, [
        line(alloc.allocationId, 1, {
          requestedReturn: "no_return",
          reason: "other",
          explanation: "Hỏng nhẹ",
          evidenceIds: [
            await uploadEvidence(request, token, order.orderNumber),
          ],
        }),
      ])
    ).status()
  ).toBe(201);
  view = await refundView(staff, order.orderId);
  const first = view.requests[0].requestId;
  view = await decide(staff, order.orderId, first, view, [
    {
      allocationId: alloc.allocationId,
      approvedQuantity: 1,
      returnRequired: false,
      reason: "Chấp nhận",
    },
  ]);
  const claimed = await claimPayout(staff, order.orderId, first, view);
  view = await recordPayout(
    staff,
    order.orderId,
    first,
    claimed,
    unit,
    "E2E-PARTIAL-1"
  );
  expect(
    (
      await customerSubmit(request, token, order.orderNumber, [
        line(alloc.allocationId, 1),
      ])
    ).status()
  ).toBe(201);

  await openCustomerOrder(page, request, order.email, order.orderNumber);
  await expect(
    page.getByText(/đã mua 4 · còn hoàn được 2 .* · đang yêu cầu 1 · đã hoàn 1/)
  ).toBeVisible();

  view = await refundView(staff, order.orderId);
  expect(view.summary).toMatchObject({ paidAmount: unit, coverage: "partial" });
  expect(view.allocations[0]).toMatchObject({
    availableQuantity: 2,
    requestedQuantity: 1,
    refundedQuantity: 1,
    requestedAmount: unit,
  });

  // Legacy whole-order paths cannot reset refundable money or restock all original units.
  const stockBefore = await stock(v.variantId);
  const revert = await staff.raw(
    "patch",
    `/orders/${order.orderId}/payment-status`,
    {
      paymentStatus: "refunded",
      action: "refund",
      note: "legacy",
      reference: "LEGACY-1",
    }
  );
  expect(
    revert.ok(),
    "legacy full refund must be refused on a partially refunded order"
  ).toBe(false);
  const returned = await staff.raw("patch", `/orders/${order.orderId}/status`, {
    status: "returned",
  });
  expect(
    returned.ok(),
    "whole-order return must be refused while refund requests exist"
  ).toBe(false);
  expect(await stock(v.variantId)).toBe(stockBefore);
  view = await refundView(staff, order.orderId);
  expect(view.summary.paidAmount).toBe(unit);
  expect(view.allocations[0]).toMatchObject({
    availableQuantity: 2,
    refundedQuantity: 1,
  });
});

test("shipping_is_retained_then_refunded_by_exception", async ({
  page,
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const fee = 30000;
  const order = await buy(playwright, staff, {
    customer: "customer1@demo.local",
    email: "customer1@demo.local",
    lines: [{ variantId: v.variantId, quantity: 2 }],
    shippingFee: fee,
  });
  seen.shipping = order;
  let view = await refundView(staff, order.orderId);
  const alloc: Allocation = view.allocations[0];
  expect(view.remainingPaidShipping).toBe(fee);

  await openCustomerOrder(page, request, order.email, order.orderNumber);
  await fillRefundRow(page, alloc.productName, {
    quantity: 1,
    explanation: "Đổi ý một chiếc",
  });
  await sendRefundForm(page);
  await expect(page.getByText(/đang yêu cầu 1/)).toBeVisible();

  view = await refundView(staff, order.orderId);
  const first = view.requests[0].requestId;
  view = await decide(
    staff,
    order.orderId,
    first,
    view,
    [
      {
        allocationId: alloc.allocationId,
        approvedQuantity: 1,
        returnRequired: false,
        reason: "Chấp nhận",
      },
    ],
    { shippingAmount: 0 }
  );
  const unit = alloc.netAmount / 2;
  let claimed = await claimPayout(staff, order.orderId, first, view);
  view = await recordPayout(
    staff,
    order.orderId,
    first,
    claimed,
    unit,
    "E2E-SHIP-1"
  );
  expect(view.summary).toMatchObject({
    paidAmount: unit,
    paidShippingAmount: 0,
  });
  expect(view.remainingPaidShipping, "shipping is retained by default").toBe(
    fee
  );

  view = await staff.post(`/orders/${order.orderId}/refunds`, {
    idempotencyKey: randomUUID(),
    expectedRevision: view.revision,
    exceptionReason: "Giao chậm, hoàn phí vận chuyển",
    shippingOnly: true,
  });
  const second = view.requests.find(
    (r: Json) => r.stage === "awaiting_review"
  ).requestId;
  view = await decide(staff, order.orderId, second, view, [], {
    shippingAmount: fee,
  });
  claimed = await claimPayout(staff, order.orderId, second, view);
  view = await recordPayout(
    staff,
    order.orderId,
    second,
    claimed,
    fee,
    "E2E-SHIP-2"
  );
  expect(
    view.summary,
    "paidAmount is merchandise only; shipping is tracked beside it"
  ).toMatchObject({ paidAmount: unit, paidShippingAmount: fee });
  expect(view.remainingPaidShipping).toBe(0);
  const accounting = (await orderDoc(order.orderId))!.refundAccounting;
  expect(accounting.receivedAmount).toBeGreaterThanOrEqual(unit + fee);
});

test("lost_payout_response_replays_once_and_second_admin_cannot_claim", async ({
  request,
  playwright,
}) => {
  const staff = await admin(request);
  const [v] = await variantsWithStock(1);
  const order = await buy(playwright, staff, {
    customer: "customer1@demo.local",
    email: "customer1@demo.local",
    lines: [{ variantId: v.variantId, quantity: 1 }],
  });
  const token = await login(request, API, order.email);
  let view = await refundView(staff, order.orderId);
  const alloc: Allocation = view.allocations[0];
  expect(
    (
      await customerSubmit(request, token, order.orderNumber, [
        line(alloc.allocationId, 1),
      ])
    ).status()
  ).toBe(201);
  view = await refundView(staff, order.orderId);
  const requestId = view.requests[0].requestId;
  view = await decide(staff, order.orderId, requestId, view, [
    {
      allocationId: alloc.allocationId,
      approvedQuantity: 1,
      returnRequired: false,
      reason: "Chấp nhận",
    },
  ]);
  const claimed = await claimPayout(staff, order.orderId, requestId, view);
  const claimId = claimed.requests[0].claim.claimId;

  // A second admin cannot take or release the claim; nothing frees it automatically.
  const second = await secondAdmin(request);
  expect(
    (
      await second.raw(
        "post",
        `/orders/${order.orderId}/refunds/${requestId}/payout-claim`,
        { idempotencyKey: randomUUID(), expectedRevision: claimed.revision }
      )
    ).status()
  ).toBe(409);
  expect(
    (
      await second.raw(
        "post",
        `/orders/${order.orderId}/refunds/${requestId}/payout-release`,
        {
          idempotencyKey: randomUUID(),
          expectedRevision: claimed.revision,
          claimId,
          bankOutcome: "not_transferred",
          reason: "Thử giải phóng",
        }
      )
    ).status()
  ).toBe(409);
  expect(
    (await refundView(staff, order.orderId)).requests[0].claim.claimId
  ).toBe(claimId);

  // The bank transfer succeeded but the response was lost: replaying the same command records nothing twice.
  const key = randomUUID();
  const body = {
    idempotencyKey: key,
    expectedRevision: claimed.revision,
    claimId,
    amount: alloc.netAmount,
    paidAt: new Date().toISOString(),
    reference: "E2E-LOST-1",
  };
  const first = await staff.post(
    `/orders/${order.orderId}/refunds/${requestId}/payout`,
    body
  );
  expect(first.summary.paidAmount).toBe(alloc.netAmount);
  const replay = await staff.raw(
    "post",
    `/orders/${order.orderId}/refunds/${requestId}/payout`,
    body
  );
  expect(replay.ok()).toBe(true);
  const after = await refundView(staff, order.orderId);
  expect(after.revision).toBe(first.revision);
  expect(after.summary.paidAmount).toBe(alloc.netAmount);
  const stored = (await orderDoc(order.orderId))!.refundAccounting.summary;
  expect(stored.paidAmount).toBe(alloc.netAmount);
  expect(
    await db()
      .collection("refund_requests")
      .countDocuments({
        orderId: new ObjectId(order.orderId),
        "payout.reference": "E2E-LOST-1",
      })
  ).toBe(1);
});

test("captured_refund_mail_exposes_no_private_fields", async () => {
  const mails = capturedMails("customer1@demo.local").filter((mail) =>
    /hoàn tiền/i.test(mail.subject)
  );
  expect(
    mails.length,
    "refund update mails reach the order contact"
  ).toBeGreaterThan(0);
  const private_ =
    /refund-evidence|X-Refund-Token|#token=|internalNote|admin2?@demo\.local|E2E-(COMBO|MISSING|RETURN|LOST|PARTIAL|SHIP)|Chấp nhận|Giao sai mẫu|Thiếu hàng đã xác nhận/;
  for (const mail of mails) {
    expect(`${mail.subject}\n${mail.text}\n${mail.html}`).not.toMatch(private_);
    expect(mail.html).toContain("localhost:3130");
  }
});

// Step 4 evidence: rendered CMS and storefront views at desktop and mobile widths, captured to
// test-results/refund-acceptance/ with automated overflow, copy, keyboard and image checks.
const SHOTS = path.resolve(__dirname, "../test-results/refund-acceptance");
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];
const CMS = process.env.REFUND_E2E_CMS!;

async function shot(page: Page, name: string, viewport: string) {
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(SHOTS, `${viewport}-${name}.png`),
    fullPage: true,
  });
}

test("rendered_cms_views_fit_both_widths_and_keep_list_filters", async ({
  page,
}) => {
  await page.goto(`${CMS}/auth/login`);
  await page.getByLabel("Email").fill("admin@demo.local");
  await page.getByLabel("Mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).not.toHaveURL(/auth[/]login/);

  const detailId = seen.partial.orderId;
  const productId = (await db()
    .collection("products")
    .findOne({}))!._id.toString();
  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    // The CMS sidebar never auto-collapses (global, pre-existing); a phone user collapses it by hand.
    const collapse = page.getByRole("button", { name: "Thu gọn menu" });
    if (vp.name === "mobile" && (await collapse.count()))
      await collapse.click();
    for (const [name, url] of [
      ["orders-list", "/orders?attention=refund-needed"],
      ["order-detail-partial", `/orders/${detailId}`],
      ["order-detail-shipping", `/orders/${seen.shipping.orderId}`],
      ["policy", "/content/store-info"],
      ["product", `/products/${productId}`],
      ["reports", "/reports"],
      ["dashboard", "/dashboard"],
    ]) {
      await page.goto(`${CMS}${url}`);
      await expect(
        page.locator("main, [role=main], .ant-layout-content").first()
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      if (name.startsWith("order-detail")) {
        await expect(
          page.getByRole("heading", { name: "Hoàn tiền" })
        ).toBeVisible();
        // Keyboard: Tab from the section heading reaches a control inside the refund section.
        await page.getByRole("heading", { name: "Hoàn tiền" }).first().focus();
        let inside = false;
        for (let i = 0; i < 40 && !inside; i += 1) {
          await page.keyboard.press("Tab");
          inside = await page.evaluate(() => {
            const heading = [...document.querySelectorAll("h3")].find(
              (h) => h.textContent === "Hoàn tiền"
            );
            return Boolean(
              heading?.parentElement?.contains(document.activeElement) &&
              document.activeElement !== document.body
            );
          });
        }
        expect(inside, "keyboard reaches refund controls").toBe(true);
      }
      await shot(page, name, vp.name);
    }
  }

  // list → detail → back keeps the URL filters.
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto(`${CMS}/orders?attention=refund-needed`);
  await page.getByRole("link", { name: "Chi tiết" }).first().click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f]{24}/);
  await page.goBack();
  await expect(page).toHaveURL(/attention=refund-needed/);
});

test("rendered_storefront_refund_views_fit_both_widths", async ({
  page,
  request,
}) => {
  const token = await login(request, API, "customer1@demo.local");
  await page
    .context()
    .addCookies([
      { name: "accessToken", value: token, domain: "localhost", path: "/" },
    ]);
  const [first] = await db()
    .collection("products")
    .find({ status: { $exists: true } })
    .limit(1)
    .toArray();
  const combo = await db().collection("combos").findOne({ status: "PUBLISH" });
  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    for (const [name, url] of [
      ["product", `/product/${first.slug}`],
      ["combo", `/combo/${combo!.slug}`],
      ["order-partial", `/user/orders/${seen.partial.orderNumber}`],
      ["order-evidence", `/user/orders/${seen.evidence.orderNumber}`],
      ["order-shipping", `/user/orders/${seen.shipping.orderNumber}`],
    ]) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalOverflow(page);
      if (name.startsWith("order-")) {
        await expect(
          page.getByRole("heading", { name: "Hoàn tiền", exact: true })
        ).toBeVisible();
        await expect(page.getByText(/Hạn gửi yêu cầu:/)).toBeVisible();
      }
      if (name === "order-evidence") {
        // Evidence thumbnails load through the authorized route, never a public URL.
        const images = page.locator(
          "section[aria-labelledby=refund-panel-title] img"
        );
        for (const img of await images.all()) {
          await expect
            .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
            .toBeGreaterThan(0);
        }
      }
      await shot(page, `storefront-${name}`, vp.name);
    }
  }

  // Checkout shows the refund notice before purchase.
  const [variant] = await variantsWithStock(1);
  const cartResponse = await request.post(`${API}/carts/add-to-cart`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { variantId: variant.variantId, quantity: 1 },
  });
  expect(cartResponse.ok()).toBe(true);
  for (const vp of VIEWPORTS) {
    await page.setViewportSize(vp);
    await page.goto("/checkout");
    await expect(page.getByText(/hoàn tiền/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await shot(page, "storefront-checkout", vp.name);
  }

  // Verified-guest panel from a fresh emailed link.
  const guest = seen.guest;
  const before = refundAccessMailCount(guest.email);
  const guestPage = await (
    await page.context().browser()!.newContext({ viewport: VIEWPORTS[1] })
  ).newPage();
  await guestPage.goto(`/refund-access?orderNumber=${guest.orderNumber}`);
  await shot(guestPage, "storefront-guest-card", "mobile");
  await guestPage.getByTestId("refund-access-request").click();
  await guestPage.goto("about:blank");
  await guestPage.goto(await waitForRefundAccessUrl(guest.email, before));
  await guestPage.getByTestId("refund-access-verify").click();
  await expect(
    guestPage.getByRole("heading", {
      name: `Hoàn tiền đơn ${guest.orderNumber}`,
    })
  ).toBeVisible();
  await expectNoHorizontalOverflow(guestPage);
  await shot(guestPage, "storefront-guest-panel", "mobile");
  await guestPage.context().close();
});
