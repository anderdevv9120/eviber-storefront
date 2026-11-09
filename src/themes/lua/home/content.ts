import { PATH } from "@/constants/paths";

// ponytail: nội dung cứng của home lua (spec §2) — ảnh Unsplash từ mockup son-lua là placeholder,
// chuyển sang CMS khi shop cần tự sửa

const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

/** Slug khớp CATEGORY_FIXTURES của seed (backend products.fixture.ts) để link lọc thật */
export const CATEGORY_TILES: { name: string; slug: string; image: string }[] = [
  {
    name: "Thời trang nữ",
    slug: "thoi-trang-nu",
    image: unsplash("1618037208874-021263b58d69", 800),
  },
  {
    name: "Quần nam",
    slug: "quan-nam",
    image: unsplash("1613915617430-8ab0fd7c6baf", 800),
  },
  {
    name: "Áo nam",
    slug: "ao-nam",
    image: unsplash("1574201635302-388dd92a4c3f", 800),
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien",
    image: unsplash("1654707636750-ab67a11b21b7", 800),
  },
];

/** Copy trang trí theo vị trí khối combo — giá/tên/link lấy từ combo thật */
export const COMBO_SLOT_COPY: {
  eyebrow: string;
  titleLines: [string, string];
  quote: string;
  description: string;
}[] = [
  {
    eyebrow: "Thời trang công sở",
    titleLines: ["Thanh lịch", "Chuyên nghiệp"],
    quote:
      "“Bộ phối công sở hiện đại, tinh tế giúp nàng tự tin trong mọi khoảnh khắc làm việc.”",
    description:
      "Các món đã phối sẵn theo một tông, mua trọn bộ trong một lần.",
  },
  {
    eyebrow: "Tiệc & sự kiện",
    titleLines: ["Dịu dàng", "Rạng rỡ"],
    quote: "“Chất liệu mềm rủ, gam màu nhẹ cho những buổi tối đáng nhớ.”",
    description:
      "Bộ phối sẵn cho tiệc, hẹn hò và chụp ảnh — xem chi tiết từng món ở trang combo.",
  },
];

export const LOOKBOOK: {
  poster: {
    titleLines: [string, string];
    line: string;
    ctaLabel: string;
    href: string;
    image: string;
    alt: string;
  };
  tiles: { label: string; href: string; image: string; alt: string }[];
} = {
  poster: {
    titleLines: ["Nét đẹp", "Mùa Thu"],
    line: "Ưu đãi cho bộ sưu tập mới",
    ctaLabel: "Mua ngay",
    href: PATH.COLLECTION,
    image: unsplash("1751278402161-08f27318d389", 1200),
    alt: "Người mẫu mặc đầm maxi trên bờ đá",
  },
  tiles: [
    {
      label: "Áo khoác",
      href: PATH.COLLECTION,
      image: unsplash("1589400445193-c881a4b0b38a", 600),
      alt: "Áo choàng màu yến mạch",
    },
    {
      label: "Đầm tiệc",
      href: PATH.COLLECTION,
      image: unsplash("1594019739447-6c8a1d744d61", 600),
      alt: "Đầm đen hai dây",
    },
    {
      label: "Len mùa lạnh",
      href: PATH.COLLECTION,
      image: unsplash("1610901157620-340856d0a50f", 600),
      alt: "Áo len xám trên cầu gỗ",
    },
    {
      label: "Túi & phụ kiện",
      href: PATH.COLLECTION,
      image: unsplash("1624687943971-e86af76d57de", 600),
      alt: "Túi da nâu",
    },
  ],
};
