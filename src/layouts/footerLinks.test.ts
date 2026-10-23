import { describe, expect, it } from "vitest";
import { policyLinks, socialLinks } from "./footerLinks";

describe("footer links", () => {
  it("links only published policies with their CMS titles, in the given order", () => {
    expect(
      policyLinks([
        { slug: "dieu-khoan", title: "Điều khoản sử dụng" },
        { slug: "bao-mat", title: "Bảo mật" },
      ])
    ).toEqual([
      { name: "Điều khoản sử dụng", link: "/chinh-sach/dieu-khoan" },
      { name: "Bảo mật", link: "/chinh-sach/bao-mat" },
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
