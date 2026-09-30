import { describe, expect, it } from "vitest";
import { formatDeliveryEstimate, formatTimeDayMonth } from "./formatTime";

describe("formatTimeDayMonth", () => {
  // Dựng Date theo giờ máy để kết quả không phụ thuộc múi giờ máy chạy test
  const iso = new Date(2026, 8, 22, 14, 5).toISOString();

  it("short: giờ, ngày/tháng — không năm", () => {
    expect(formatTimeDayMonth(iso)).toBe("14:05, 22/09");
  });

  it("long: giờ ngày ngày/tháng", () => {
    expect(formatTimeDayMonth(iso, "long")).toBe("14:05 ngày 22/09");
  });

  it("trả chuỗi rỗng khi ISO không hợp lệ", () => {
    expect(formatTimeDayMonth("not-a-date")).toBe("");
  });
});

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
