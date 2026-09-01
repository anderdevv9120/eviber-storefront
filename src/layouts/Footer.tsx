import { CSSProperties } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Logo, Instagram, Facebook, Twitter } from "@/components/icons";
import { PATH } from "@/constants/paths";

const shoppingLinks = [
  { name: "Sản phẩm", link: PATH.COLLECTION },
  { name: "Đang khuyến mãi", link: PATH.COLLECTION },
  { name: "Hàng mới về", link: PATH.COLLECTION },
  { name: "Voucher", link: PATH.VOUCHER },
];

// Trang chính sách chưa tồn tại — giữ chỗ UI, bổ sung link khi có trang
const supportLinks = [
  { name: "Điều khoản – Điều kiện", link: PATH.DEFAULT },
  { name: "Chính sách đổi trả", link: PATH.DEFAULT },
  { name: "Chính sách hỗ trợ", link: PATH.DEFAULT },
  { name: "Chính sách bảo mật", link: PATH.DEFAULT },
];

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: { name: string; link: string }[];
}) => (
  <div>
    <p className="font-bold mb-4 text-white">{title}</p>
    <div className="flex flex-col gap-2.5 text-sm text-primary-200">
      {links.map((item) => (
        <Link
          key={item.name}
          href={item.link}
          className="w-fit hover:text-white transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </div>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white mt-16 md:mt-20">
      {/* Mobile: brand + newsletter full-width, 2 cột link đứng cạnh nhau (footer ngắn lại ~nửa) */}
      <div className="container-base pt-12 pb-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4 items-start col-span-2 lg:col-span-1">
          <Link href={PATH.HOME} aria-label="CLOTHES — về trang chủ">
            <Logo
              className="text-white"
              style={
                { "--logo-dot": "var(--color-primary-300)" } as CSSProperties
              }
            />
          </Link>

          <div id="lien-he" className="text-sm text-primary-200 scroll-mt-24">
            <p className="font-semibold text-white mb-1">
              Liên hệ với chúng tôi
            </p>
            <p>Số 8 Phạm Hùng, Mai Dịch, Cầu Giấy, Hà Nội</p>
            <p>hotro@clothes.vn · 1900 0000</p>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              href={PATH.DEFAULT}
              aria-label="Facebook"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-700 text-primary-100 hover:text-white transition-colors"
            >
              <Facebook />
            </Link>
            <Link
              href={PATH.DEFAULT}
              aria-label="Instagram"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-700 text-primary-100 hover:text-white transition-colors"
            >
              <Instagram />
            </Link>
            <Link
              href={PATH.DEFAULT}
              aria-label="Twitter"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-700 text-primary-100 hover:text-white transition-colors"
            >
              <Twitter />
            </Link>
          </div>
        </div>

        <FooterColumn title="Mua sắm" links={shoppingLinks} />
        <FooterColumn title="Hỗ trợ khách hàng" links={supportLinks} />

        {/* Newsletter decorative ở cột 4 (chốt theo mockup F-D) — chưa có BE, chỉ UI */}
        <div className="col-span-2 lg:col-span-1">
          <p className="font-bold mb-4 text-white">Nhận ưu đãi sớm nhất</p>
          <p className="text-sm text-primary-200 mb-4">
            Đăng ký để không bỏ lỡ deal mới và bộ sưu tập mỗi tuần.
          </p>
          <div className="flex items-center bg-white rounded-full p-1.5 w-full max-w-[340px]">
            <Input
              type="text"
              placeholder="Email của bạn"
              className="flex-1 min-w-0 border-none h-10 bg-white rounded-full px-4"
            />
            <Button className="h-10 rounded-full px-5 text-sm shrink-0">
              Đăng ký
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-base py-4 flex flex-col sm:flex-row gap-1 items-center justify-between text-sm text-primary-200">
          <p>© 2026 CLOTHES. All rights reserved.</p>
          <p>Việt Nam · VND</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
