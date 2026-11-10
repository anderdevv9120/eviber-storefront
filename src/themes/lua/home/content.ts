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

/** Copy + ảnh trang trí theo vị trí khối combo (ảnh = mockup .split-hero / .strip, showcase) — giá/tên/link lấy từ combo thật */
export const COMBO_SLOT_COPY: {
  eyebrow: string;
  titleLines: [string, string];
  quote: string;
  description: string;
  heroImage: string;
  gridImages: [string, string, string];
}[] = [
  {
    eyebrow: "Thời trang công sở",
    titleLines: ["Thanh lịch", "Chuyên nghiệp"],
    quote:
      "“Bộ phối công sở hiện đại, tinh tế giúp nàng tự tin trong mọi khoảnh khắc làm việc.”",
    description:
      "Các món đã phối sẵn theo một tông, mua trọn bộ trong một lần.",
    heroImage: unsplash("1592818628487-b273941a7849", 1200),
    gridImages: [
      unsplash("1618333453296-9e35280fd6b1", 500),
      unsplash("1673105793839-6c2811a4e1e7", 500),
      unsplash("1637102146291-c408b298e22b", 500),
    ],
  },
  {
    eyebrow: "Tiệc & sự kiện",
    titleLines: ["Dịu dàng", "Rạng rỡ"],
    quote: "“Chất liệu mềm rủ, gam màu nhẹ cho những buổi tối đáng nhớ.”",
    description:
      "Bộ phối sẵn cho tiệc, hẹn hò và chụp ảnh — xem chi tiết từng món ở trang combo.",
    heroImage: unsplash("1779406545010-c439e41fded7", 1200),
    gridImages: [
      unsplash("1777713272516-e7b2216fe15e", 500),
      unsplash("1625158244856-e5e20f733c1f", 500),
      unsplash("1679973506598-5d29b280eef8", 500),
    ],
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

/** Brand story (mockup .story-row): head section, nhãn + ảnh 2 hàng, chữ hàng 2 — CMS chỉ có 1 khối chữ.
 *  Ảnh lấy cứng từ mockup (showcase), không dùng brandStory.image/image2 */
// Cùng ảnh mockup nhưng đúng URL seed CMS (w=800&q=80): bản w=1200 tải > 7s → next/image 504 trên mạng chậm
const STORY_IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const BRAND_STORY = {
  heading: "Từ xưởng may nhỏ đến tủ đồ của nàng",
  first: {
    eyebrow: "01 / Xưởng may",
    image: STORY_IMG("1787505136265-9a99dad3bbac"),
    alt: "Thợ may cắt vải trắng trong xưởng",
  },
  second: {
    eyebrow: "02 / Phom dáng",
    title: "Thử trên dáng người Việt",
    body: "Bảng size đo lại trên 200 khách thật. Không vừa? Đổi size miễn phí trong 30 ngày.",
    image: STORY_IMG("1787505136296-1e8f0750e5ff"),
    alt: "Thợ may chỉnh đầm trắng trên ma-nơ-canh",
  },
};
