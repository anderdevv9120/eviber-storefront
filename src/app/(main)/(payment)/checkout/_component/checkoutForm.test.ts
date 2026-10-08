import { describe, expect, it } from "vitest";
import { checkoutSchema, type CheckoutSchemaContext } from "./checkoutForm";
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
