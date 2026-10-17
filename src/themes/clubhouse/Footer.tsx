import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Facebook, Instagram, Twitter } from "@/components/icons";
import { PATH } from "@/constants/paths";
import {
  policyLinks,
  socialLinks,
  type SocialKey,
} from "@/layouts/footerLinks";
import type { ThemeFooterProps } from "@/themes/types";
import Wordmark from "./Wordmark";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600";

const shoppingLinks = [
  { name: "Tất cả sản phẩm", link: PATH.COLLECTION },
  { name: "Bán chạy", link: `${PATH.COLLECTION}?sort=bestseller` },
  { name: "Giỏ hàng", link: PATH.CART },
];

const SOCIAL_ICONS: Record<
  SocialKey,
  { label: string; Icon: typeof Facebook }
> = {
  facebook: { label: "Facebook", Icon: Facebook },
  instagram: { label: "Instagram", Icon: Instagram },
  twitter: { label: "Twitter", Icon: Twitter },
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { name: string; link: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink mb-2">
        {title}
      </p>
      <ul className="text-sm text-dark-500">
        {links.map((item) => (
          <li key={item.link}>
            <Link
              href={item.link}
              className={`inline-flex items-center min-h-11 rounded-sm hover:text-ink transition-colors ${FOCUS_RING}`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ settings }: ThemeFooterProps) {
  const supportLinks = policyLinks(settings.publishedPolicySlugs);
  const socials = socialLinks(settings.socials);

  return (
    <footer className="bg-page text-ink border-t border-ink/[.12] mt-16 md:mt-24">
      <div className="container-base pt-14 pb-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1 flex flex-col items-start gap-5">
          <p className="text-sm text-dark-500 max-w-[360px]">
            {BRAND.description}
          </p>
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ key, href }) => {
                const { label, Icon } = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`grid place-items-center size-11 rounded-full border border-ink/[.12] text-ink hover:bg-white-100 transition-colors ${FOCUS_RING}`}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <FooterColumn title="Mua sắm" links={shoppingLinks} />
        {supportLinks.length > 0 && (
          <FooterColumn title="Hỗ trợ khách hàng" links={supportLinks} />
        )}

        <div
          id="lien-he"
          className="col-span-2 lg:col-span-1 text-sm text-dark-500 scroll-mt-[var(--header-offset)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink mb-3">
            Liên hệ
          </p>
          <p className="text-balance">{settings.contact.address}</p>
          <p className="mt-1">{settings.contact.email}</p>
          <p className="mt-1">{settings.contact.phone}</p>
        </div>
      </div>

      {/* Wordmark khổng lồ chốt trang — được xuống dòng nếu tên brand dài (không tràn ngang) */}
      <div className="container-base">
        <Link
          href={PATH.HOME}
          aria-label={`${BRAND.name} — về trang chủ`}
          className={`block rounded-md text-ink ${FOCUS_RING}`}
        >
          <Wordmark className="block text-[clamp(56px,16vw,232px)] whitespace-normal break-words pb-[0.12em]" />
        </Link>
      </div>

      <div className="border-t border-ink/[.12]">
        <div className="container-base py-4 flex flex-col sm:flex-row gap-1 items-center justify-between text-sm text-dark-500">
          <p>{`© 2026 ${BRAND.name}. All rights reserved.`}</p>
          <p>Việt Nam · VND</p>
        </div>
      </div>
    </footer>
  );
}
