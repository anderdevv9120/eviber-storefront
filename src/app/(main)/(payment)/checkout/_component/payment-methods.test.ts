import { describe, expect, it } from "vitest";
import {
  availablePaymentMethods,
  keepAvailableMethod,
} from "./payment-methods";

const values = (available: boolean | undefined) =>
  availablePaymentMethods(available).map((method) => method.value);

describe("checkout payment methods theo cấu hình payOS", () => {
  it("shop đã cấu hình → COD + chuyển khoản", () => {
    expect(values(true)).toEqual(["CASH", "BANK_TRANSFER"]);
  });

  it("chưa cấu hình hoặc chưa biết → chỉ COD", () => {
    expect(values(false)).toEqual(["CASH"]);
    expect(values(undefined)).toEqual(["CASH"]);
  });

  it("đang chọn chuyển khoản mà shop tắt → về COD; còn hợp lệ thì giữ", () => {
    expect(
      keepAvailableMethod("BANK_TRANSFER", availablePaymentMethods(false))
    ).toBe("CASH");
    expect(
      keepAvailableMethod("BANK_TRANSFER", availablePaymentMethods(true))
    ).toBe("BANK_TRANSFER");
    expect(keepAvailableMethod("CASH", availablePaymentMethods(false))).toBe(
      "CASH"
    );
    expect(keepAvailableMethod(undefined, availablePaymentMethods(true))).toBe(
      "CASH"
    );
  });
});
