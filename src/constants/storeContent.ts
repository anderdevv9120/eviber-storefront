import type { IStoreSettings, PolicySlug } from "@/@types/StoreContent.type";

// Thứ tự footer — khớp BE POLICY_SLUGS
export const POLICY_SLUGS: PolicySlug[] = [
  "dieu-khoan",
  "doi-tra",
  "ho-tro",
  "bao-mat",
];

export const POLICY_TITLES: Record<PolicySlug, string> = {
  "dieu-khoan": "Điều khoản – Điều kiện",
  "doi-tra": "Chính sách đổi trả",
  "ho-tro": "Chính sách hỗ trợ",
  "bao-mat": "Chính sách bảo mật",
};

export const isPolicySlug = (value: string): value is PolicySlug =>
  (POLICY_SLUGS as string[]).includes(value);

// Bản sao nội dung hardcode cũ — BE lỗi thì footer/home/product vẫn render;
// publishedPolicySlugs rỗng để không link tới trang có thể 404
export const STORE_SETTINGS_FALLBACK: IStoreSettings = {
  contact: {
    address: "Số 8 Phạm Hùng, Mai Dịch, Cầu Giấy, Hà Nội",
    email: "hotro@clothes.vn",
    phone: "1900 0000",
  },
  socials: { facebook: "", instagram: "", twitter: "" },
  promoTiles: [
    {
      title: "Ưu đãi đến 50%",
      description: "Hàng trăm item đang giảm giá — số lượng có hạn.",
      ctaLabel: "Mua ngay",
      href: "/collection",
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop",
      theme: "light",
    },
    {
      title: "Hàng mới về mỗi tuần",
      description: "Cập nhật thiết kế mới nhất của mùa này.",
      ctaLabel: "Khám phá",
      href: "/collection",
      image:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
      theme: "dark",
    },
  ],
  homePromises: [
    { title: "Miễn phí vận chuyển", description: "Cho đơn hàng từ 499K" },
    { title: "Đổi trả miễn phí", description: "Trong vòng 7 ngày" },
    { title: "Chất lượng đảm bảo", description: "Bảo hành đến 730 ngày" },
    { title: "Thanh toán an toàn", description: "Nhiều phương thức linh hoạt" },
  ],
  productPromises: [
    "Giao toàn quốc 2–4 ngày",
    "Đổi size miễn phí 30 ngày",
    "Thanh toán khi nhận (COD)",
  ],
  publishedPolicySlugs: [],
};
