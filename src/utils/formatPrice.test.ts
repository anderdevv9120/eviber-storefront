import { describe, expect, it } from "vitest";
import {
  calculateCurrentPrice,
  calculateDiscountPrice,
  formatPrice,
} from "./formatPrice";

describe("formatPrice", () => {
  it("chèn dấu chấm phân tách hàng nghìn và thêm hậu tố đ", () => {
    expect(formatPrice(1000000)).toBe("1.000.000đ");
    expect(formatPrice(1000)).toBe("1.000đ");
  });

  it("số dưới 1000 giữ nguyên, không có dấu phân tách", () => {
    expect(formatPrice(100)).toBe("100đ");
  });

  it("quy về 0 với giá trị rỗng (0, NaN, undefined)", () => {
    expect(formatPrice(0)).toBe("0đ");
    expect(formatPrice(NaN)).toBe("0đ");
    expect(formatPrice(undefined as unknown as number)).toBe("0đ");
  });
});

describe("calculateCurrentPrice", () => {
  it("tính giá sau khi trừ phần trăm giảm", () => {
    expect(calculateCurrentPrice(100000, 10)).toBe(90000);
    expect(calculateCurrentPrice(100000, 100)).toBe(0);
  });

  it("giảm 0% trả về nguyên giá", () => {
    expect(calculateCurrentPrice(100000, 0)).toBe(100000);
  });

  it("làm tròn về số nguyên (không giữ phần thập phân)", () => {
    expect(calculateCurrentPrice(333, 10)).toBe(300);
  });

  it("quy về 0 với price/discount rỗng", () => {
    expect(calculateCurrentPrice(null as unknown as number, 10)).toBe(0);
    expect(calculateCurrentPrice(100000, null as unknown as number)).toBe(
      100000
    );
  });
});

describe("calculateDiscountPrice", () => {
  it("tính số tiền được giảm = giá gốc trừ giá hiện tại", () => {
    expect(calculateDiscountPrice(100000, 90000)).toBe(10000);
    expect(calculateDiscountPrice(100000, 100000)).toBe(0);
  });

  it("nhất quán với calculateCurrentPrice cho cùng mức giảm", () => {
    const price = 250000;
    const current = calculateCurrentPrice(price, 20);
    expect(calculateDiscountPrice(price, current)).toBe(50000);
  });

  it("quy về 0 với giá trị rỗng", () => {
    expect(calculateDiscountPrice(100000, null as unknown as number)).toBe(
      100000
    );
    expect(calculateDiscountPrice(null as unknown as number, 5000)).toBe(-5000);
  });
});
