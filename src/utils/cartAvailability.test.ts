import { describe, expect, it } from "vitest";
import { comboUnavailableReason, unavailableReason } from "./cartAvailability";

describe("unavailableReason", () => {
  it("calls a line with stock left but not purchasable ngừng bán", () => {
    expect(unavailableReason({ availableQuantity: 4 })).toBe("Ngừng bán");
  });

  it("calls a line without stock tạm hết hàng", () => {
    expect(unavailableReason({ availableQuantity: 0 })).toBe("Tạm hết hàng");
  });
});

describe("comboUnavailableReason", () => {
  it("explains when the combo's contents have changed", () => {
    expect(
      comboUnavailableReason({
        isAvailable: false,
        unavailableReason: "COMBO_CHANGED",
      })
    ).toBe("Combo đã thay đổi, vui lòng thêm lại");
  });

  it("explains when the combo is no longer sold", () => {
    expect(
      comboUnavailableReason({
        isAvailable: false,
        unavailableReason: "COMBO_UNAVAILABLE",
      })
    ).toBe("Combo tạm ngừng bán");
  });

  it("explains when the combo is out of stock", () => {
    expect(
      comboUnavailableReason({
        isAvailable: false,
        unavailableReason: "OUT_OF_STOCK",
      })
    ).toBe("Hết hàng");
  });

  it("returns null for an available combo", () => {
    expect(
      comboUnavailableReason({ isAvailable: true, unavailableReason: null })
    ).toBeNull();
  });
});
