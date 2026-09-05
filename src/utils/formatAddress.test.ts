import { describe, expect, it } from "vitest";
import { formatAddress } from "./formatAddress";

describe("formatAddress", () => {
  it("địa chỉ 2 cấp (district rỗng) không lòi dấu phẩy thừa", () => {
    expect(
      formatAddress({
        specificAddress: "12 Nguyễn Huệ",
        ward: "Phường Sài Gòn",
        district: "",
        city: "Thành phố Hồ Chí Minh",
      })
    ).toBe("12 Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh");
  });

  it("district undefined cũng bị bỏ qua", () => {
    expect(formatAddress({ specificAddress: "1", ward: "X", city: "Y" })).toBe(
      "1, X, Y"
    );
  });
});
