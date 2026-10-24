import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  toExpectedRefundTerms,
  type CheckoutSchemaContext,
} from "./checkoutForm";
import type { ICheckoutReview } from "@/@types/Order.type";
import {
  PAYMENT_METHOD_MESSAGE,
  WARD_REQUIRED_MESSAGE,
} from "@/constants/validate";

const shipping = {
  fullName: "Nguyen Van A",
  phoneNumber: "0912345678",
  email: "a@example.com",
  address: "12 Street",
  province: "City",
  ward: "Ward",
};
const context: CheckoutSchemaContext = {
  useSavedAddress: false,
  noPaymentRequired: true,
};

describe("authoritatively free checkout", () => {
  it("accepts valid shipping with no hidden payment value", async () => {
    await expect(
      checkoutSchema.validate(shipping, { context })
    ).resolves.toMatchObject(shipping);
    await expect(
      checkoutSchema.validateAt(
        "paymentMethod",
        { paymentMethod: undefined },
        { context }
      )
    ).resolves.toBeUndefined();
  });
  it("still requires payment for a payable review", async () => {
    await expect(
      checkoutSchema.validateAt(
        "paymentMethod",
        {},
        { context: { ...context, noPaymentRequired: false } }
      )
    ).rejects.toThrow(PAYMENT_METHOD_MESSAGE);
  });
  it("never weakens shipping validation", async () => {
    await expect(
      checkoutSchema.validate({ ...shipping, ward: "" }, { context })
    ).rejects.toThrow(WARD_REQUIRED_MESSAGE);
  });
});

describe("toExpectedRefundTerms", () => {
  const refundTerms: ICheckoutReview["refundTerms"] = {
    policyRevision: 4,
    products: [
      { productId: "64b000000000000000000001", refundEnabled: true },
      { productId: "64b000000000000000000002", refundEnabled: false },
    ],
  };

  it("submits exactly the reviewed policy revision and product flags", () => {
    expect(toExpectedRefundTerms({ refundTerms })).toEqual({
      policyRevision: 4,
      products: [
        { productId: "64b000000000000000000001", refundEnabled: true },
        { productId: "64b000000000000000000002", refundEnabled: false },
      ],
    });
  });

  it("copies only the contract keys, so extra review data never reaches the DTO", () => {
    const withExtra = {
      policyRevision: 1,
      products: [
        {
          productId: "64b000000000000000000003",
          refundEnabled: false,
          name: "x",
        },
      ],
    };
    expect(toExpectedRefundTerms({ refundTerms: withExtra })).toEqual({
      policyRevision: 1,
      products: [
        { productId: "64b000000000000000000003", refundEnabled: false },
      ],
    });
  });

  it("does not alias the review, so later review changes cannot rewrite the payload", () => {
    const expected = toExpectedRefundTerms({ refundTerms });
    expect(expected.products).not.toBe(refundTerms.products);
    expect(expected.products[0]).not.toBe(refundTerms.products[0]);
  });
});
