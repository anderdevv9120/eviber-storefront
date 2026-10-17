"use client";

import { Suspense, useRef, useState } from "react";
import { BRAND } from "@/config/brand";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MenuIcon, Search, XMark } from "@/components/icons";
import UserAction from "@/layouts/Header/UserAction";
import SearchBox from "@/layouts/Header/SearchBox";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import useClickOutside from "@/hooks/useClickOutside";
import type { ThemeHeaderProps } from "@/themes/types";
import Wordmark from "./Wordmark";

// "Liên hệ" chưa có trang riêng — neo xuống khối liên hệ ở Footer (id="lien-he")
const CONTACT_ANCHOR = `${PATH.HOME}#lien-he`;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600";

const ICON_BUTTON = cn(
  "grid place-items-center size-11 rounded-full text-ink transition-colors hover:bg-white-100",
  FOCUS_RING
);

// Cùng quy ước Category.tsx: thiếu slug → collection trần (không filter được)
const categoryHref = (slug?: string) =>
  slug
    ? `${PATH.COLLECTION}?category=${encodeURIComponent(slug)}`
    : PATH.COLLECTION;

// Logo căn giữa → danh mục chia đôi trái/phải (≥ xl); "all" = menu gọn < xl
type NavPart = "left" | "right" | "all";

function NavLinks({
  categories,
  activeSlug,
  part,
  onNavigate,
}: ThemeHeaderProps & {
  activeSlug: string | null;
  part: NavPart;
  onNavigate?: () => void;
}) {
  const items = [
    ...categories.map((category) => ({
      key: category._id,
      name: category.name,
      href: categoryHref(category.slug),
      active: !!category.slug && category.slug === activeSlug,
    })),
    { key: "contact", name: "Liên hệ", href: CONTACT_ANCHOR, active: false },
  ];
  const half = Math.ceil(items.length / 2);
  const shown =
    part === "left"
      ? items.slice(0, half)
      : part === "right"
        ? items.slice(half)
        : items;
  const stacked = part === "all";

  return (
    <ul className={cn("flex", stacked ? "flex-col py-2" : "gap-1")}>
      {shown.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex items-center min-h-11 rounded-sm whitespace-nowrap transition-colors hover:text-ink",
              stacked ? "px-[var(--container-px)] text-base" : "px-3 text-sm",
              FOCUS_RING,
              item.active
                ? "text-ink underline underline-offset-[6px] decoration-1"
                : "text-dark-500"
            )}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Bọc Suspense (như rosier/court): useSearchParams ép CSR bail-out chỉ trong boundary này
function NavLinksFromUrl(
  props: ThemeHeaderProps & { part: NavPart; onNavigate?: () => void }
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug =
    pathname === PATH.COLLECTION ? searchParams.get("category") : null;
  return <NavLinks {...props} activeSlug={activeSlug} />;
}

function NavSlot(
  props: ThemeHeaderProps & { part: NavPart; onNavigate?: () => void }
) {
  return (
    <Suspense fallback={<NavLinks {...props} activeSlug={null} />}>
      <NavLinksFromUrl {...props} />
    </Suspense>
  );
}

export default function Header({ categories }: ThemeHeaderProps) {
  const [open, setOpen] = useState<"search" | "menu" | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(null);
  const toggle = (panel: "search" | "menu") =>
    setOpen((current) => (current === panel ? null : panel));
  // Đóng menu bằng Escape/nút toggle → trả focus về toggle (không rơi về <body>)
  const closeMenu = () => {
    close();
    menuToggleRef.current?.focus();
  };
  useClickOutside(headerRef, () =>
    setOpen((current) => (current === "menu" ? null : current))
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-page border-b border-ink/[.12]"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open === "menu") closeMenu();
      }}
    >
      {/* < sm: cụm phải (tài khoản + "Giỏ (99+)") rộng hơn 1fr → bỏ căn giữa tuyệt đối, ô giữa co giãn; tìm kiếm vào menu */}
      <div className="container-base h-[72px] grid grid-cols-[auto_1fr_auto] gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 items-center">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            aria-label={open === "menu" ? "Đóng danh mục" : "Danh mục"}
            aria-expanded={open === "menu"}
            aria-controls="clubhouse-menu"
            ref={menuToggleRef}
            onClick={() => (open === "menu" ? closeMenu() : toggle("menu"))}
            className={cn(ICON_BUTTON, "xl:hidden")}
          >
            {open === "menu" ? (
              <XMark className="w-4 h-4" />
            ) : (
              <MenuIcon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            aria-label={open === "search" ? "Đóng tìm kiếm" : "Tìm kiếm"}
            aria-expanded={open === "search"}
            onClick={() => toggle("search")}
            className={cn(ICON_BUTTON, "hidden sm:grid")}
          >
            <Search />
          </button>
          <nav aria-label="Danh mục" className="hidden xl:block min-w-0">
            <NavSlot categories={categories} part="left" />
          </nav>
        </div>

        <Link
          href={PATH.HOME}
          aria-label={`${BRAND.name} — về trang chủ`}
          className={cn(
            "inline-flex items-center min-h-11 justify-self-center rounded-sm text-ink",
            FOCUS_RING
          )}
        >
          <Wordmark className="text-[22px] sm:text-[30px]" />
        </Link>

        <div className="flex items-center justify-end gap-1 min-w-0">
          <nav aria-label="Danh mục khác" className="hidden xl:block min-w-0">
            <NavSlot categories={categories} part="right" />
          </nav>
          <UserAction cartDisplay="pill" />
        </div>
      </div>

      {/* Panel overlay dưới header (không đẩy nội dung trang) */}
      {open === "menu" && (
        <nav
          id="clubhouse-menu"
          aria-label="Danh mục"
          className="xl:hidden absolute inset-x-0 top-full bg-page border-b border-ink/[.12] shadow-card"
        >
          <div className="sm:hidden px-[var(--container-px)] pt-3">
            <SearchBox
              variant="mobile"
              onSubmitted={close}
              onEscape={closeMenu}
            />
          </div>
          <NavSlot categories={categories} part="all" onNavigate={close} />
        </nav>
      )}
      {open === "search" && (
        <div
          data-testid="mobile-search-bar"
          className="absolute inset-x-0 top-full flex items-center gap-3 bg-page border-b border-ink/[.12] px-[var(--container-px)] py-3 shadow-card"
        >
          <SearchBox
            variant="mobile"
            autoFocus
            className="flex-1"
            onSubmitted={close}
            onEscape={close}
          />
          <button
            type="button"
            onClick={close}
            className={cn(
              "relative whitespace-nowrap text-[15px] text-dark-500 transition-colors hover:text-ink rounded-sm after:absolute after:-inset-3 after:content-['']",
              FOCUS_RING
            )}
          >
            Hủy
          </button>
        </div>
      )}
    </header>
  );
}
