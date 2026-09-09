import { describe, expect, it } from "vitest";
import { formatDeliveryEstimate } from "./formatTime";

describe("formatDeliveryEstimate", () => {
  it("cộng số ngày vào ngày đặt", () => {
    expect(formatDeliveryEstimate("2026-09-09T02:24:00.000Z", 3, 5)).toBe(
      "12/09 – 14/09"
    );
  });

  it("nhảy qua ranh giới tháng", () => {
    expect(formatDeliveryEstimate("2026-09-29T02:24:00.000Z", 3, 5)).toBe(
      "02/10 – 04/10"
    );
  });

  it("trả chuỗi rỗng khi ngày đặt không hợp lệ", () => {
    expect(formatDeliveryEstimate("", 3, 5)).toBe("");
  });
});
