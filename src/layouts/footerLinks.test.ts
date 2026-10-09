import { describe, expect, it } from "vitest";
import { policyLinks, socialLinks } from "./footerLinks";

describe("footer links", () => {
  it("links only published policies, in the given order", () => {
    expect(policyLinks(["dieu-khoan", "bao-mat"])).toEqual([
      { name: "Điều khoản – Điều kiện", link: "/chinh-sach/dieu-khoan" },
      { name: "Chính sách bảo mật", link: "/chinh-sach/bao-mat" },
    ]);
    expect(policyLinks([])).toEqual([]);
  });

  it("hides empty social links", () => {
    expect(
      socialLinks({
        facebook: "https://fb.com/x",
        instagram: "",
        twitter: "https://x.com/x",
      })
    ).toEqual([
      { key: "facebook", href: "https://fb.com/x" },
      { key: "twitter", href: "https://x.com/x" },
    ]);
  });
});
