import Link from "next/link";
import { BRAND } from "@/config/brand";
import { PATH } from "@/constants/paths";
import { policyLinks, socialLinks } from "@/layouts/footerLinks";
import type { ThemeFooterProps } from "@/themes/types";
import Wordmark from "./Wordmark";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink";

export default function Footer({ settings }: ThemeFooterProps) {
  const policies = policyLinks(settings.publishedPolicySlugs);
  const socials = socialLinks(settings.socials);
  return (
    <footer className="mt-16 border-t border-ink text-ink md:mt-24">
      <div className="container-base">
        <div className="grid border-b border-ink md:grid-cols-3">
          <div
            id="lien-he"
            className="min-w-0 scroll-mt-[var(--header-offset)] py-8 md:pr-8"
          >
            <h2 className="mb-4 text-sm font-bold uppercase">Liên hệ</h2>
            <p className="max-w-sm text-sm leading-relaxed text-dark-500">
              {settings.contact.address}
            </p>
            <a
              href={`mailto:${settings.contact.email}`}
              className={`flex min-h-11 w-fit max-w-full items-center break-all text-sm hover:underline ${FOCUS}`}
            >
              {settings.contact.email}
            </a>
            <a
              href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
              className={`inline-flex min-h-11 items-center text-sm tabular-nums hover:underline ${FOCUS}`}
            >
              {settings.contact.phone}
            </a>
          </div>
          <div className="border-t border-ink py-8 md:border-l md:border-t-0 md:px-8">
            <h2 className="mb-4 text-sm font-bold uppercase">Mua sắm</h2>
            <ul className="text-sm">
              {[
                { name: "Tất cả sản phẩm", link: PATH.COLLECTION },
                {
                  name: "Bán chạy",
                  link: `${PATH.COLLECTION}?sort=bestseller`,
                },
                { name: "Giỏ hàng", link: PATH.CART },
              ].map((item) => (
                <li key={item.link}>
                  <Link
                    href={item.link}
                    className={`inline-flex min-h-11 items-center hover:underline ${FOCUS}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {(policies.length > 0 || socials.length > 0) && (
            <div className="border-t border-ink py-8 md:border-l md:border-t-0 md:pl-8">
              {policies.length > 0 && (
                <>
                  <h2 className="mb-4 text-sm font-bold uppercase">
                    Hỗ trợ khách hàng
                  </h2>
                  <ul className="text-sm">
                    {policies.map((item) => (
                      <li key={item.link}>
                        <Link
                          href={item.link}
                          className={`inline-flex min-h-11 items-center hover:underline ${FOCUS}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {socials.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 text-sm">
                  {socials.map(({ key, href }) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex min-h-11 items-center capitalize hover:underline ${FOCUS}`}
                      >
                        {key}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <Link
          href={PATH.HOME}
          aria-label={`${BRAND.name} — về trang chủ`}
          className={`block py-6 ${FOCUS}`}
        >
          <Wordmark className="block break-words text-[clamp(48px,12vw,180px)]" />
        </Link>
        <div className="flex flex-wrap justify-between gap-2 border-t border-ink py-5 text-xs text-dark-500">
          <p>© {BRAND.name}. Bảo lưu mọi quyền.</p>
          <p>Việt Nam · VND</p>
        </div>
      </div>
    </footer>
  );
}
