import { describe, expect, it } from "vitest";
import { unavailableReason } from "./cartAvailability";

describe("unavailableReason", () => {
  it("calls a line with stock left but not purchasable ngừng bán", () => {
    expect(unavailableReason({ availableQuantity: 4 })).toBe("Ngừng bán");
  });

  it("calls a line without stock tạm hết hàng", () => {
    expect(unavailableReason({ availableQuantity: 0 })).toBe("Tạm hết hàng");
  });
});
