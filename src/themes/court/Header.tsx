"use client";

import { Suspense, useState } from "react";
import { BRAND } from "@/config/brand";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "@/components/icons";
import UserAction from "@/layouts/Header/UserAction";
import SearchBox from "@/layouts/Header/SearchBox";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import type { ThemeHeaderProps } from "@/themes/types";
import Wordmark from "./Wordmark";

// "Liên hệ" chưa có trang riêng — neo xuống khối liên hệ ở Footer (id="lien-he")
const CONTACT_ANCHOR = `${PATH.HOME}#lien-he`;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600";

// Cùng quy ước Category.tsx: thiếu slug → collection trần (không filter được)
const categoryHref = (slug?: string) =>
  slug
    ? `${PATH.COLLECTION}?category=${encodeURIComponent(slug)}`
    : PATH.COLLECTION;

function CategoryNav({
  categories,
  activeSlug,
  className,
}: ThemeHeaderProps & { activeSlug: string | null; className?: string }) {
  const pathname = usePathname();
  const items = [
    {
      key: "home",
      name: "Trang chủ",
      href: PATH.HOME,
      active: pathname === PATH.HOME,
    },
    ...categories.map((category) => ({
      key: category._id,
      name: category.name,
      href: categoryHref(category.slug),
      active: !!category.slug && category.slug === activeSlug,
    })),
    { key: "contact", name: "Liên hệ", href: CONTACT_ANCHOR, active: false },
  ];

  return (
    <nav
      aria-label="Danh mục"
      className={cn(
        "flex gap-1 overflow-x-auto scrollbar-hide max-w-full text-sm font-medium",
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          // Chrome không tự cuộn link bị che một phần khi Tab tới — kéo vào khung nav
          onFocus={(e) =>
            e.currentTarget.scrollIntoView({
              block: "nearest",
              inline: "nearest",
            })
          }
          className={cn(
            "relative px-3 min-h-11 flex items-center rounded-md whitespace-nowrap transition-colors hover:text-ink",
            FOCUS_RING,
            item.active
              ? "text-ink font-semibold after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-ink after:content-['']"
              : "text-dark-500"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

// Bọc Suspense (như rosier): useSearchParams ép CSR bail-out chỉ trong boundary này
function CategoryNavFromUrl({
  categories,
  className,
}: ThemeHeaderProps & { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug =
    pathname === PATH.COLLECTION ? searchParams.get("category") : null;
  return (
    <CategoryNav
      categories={categories}
      activeSlug={activeSlug}
      className={className}
    />
  );
}

function CategoryNavSlot({
  categories,
  className,
}: ThemeHeaderProps & { className?: string }) {
  return (
    <Suspense
      fallback={
        <CategoryNav
          categories={categories}
          activeSlug={null}
          className={className}
        />
      }
    >
      <CategoryNavFromUrl categories={categories} className={className} />
    </Suspense>
  );
}

export default function Header({ categories }: ThemeHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-page border-b border-white-300">
        <div className="container-base h-[72px] flex items-center justify-between gap-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Link
            href={PATH.HOME}
            aria-label={`${BRAND.name} — về trang chủ`}
            className={cn("inline-flex rounded-md text-ink", FOCUS_RING)}
          >
            <Wordmark className="text-[22px] sm:text-[26px]" />
          </Link>

          <div className="hidden lg:flex justify-center min-w-0">
            <CategoryNavSlot categories={categories} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
              className={cn(
                "grid place-items-center size-11 rounded-full transition-colors hover:bg-white-100",
                FOCUS_RING,
                isSearchOpen ? "text-primary-600" : "text-dark-600"
              )}
            >
              <Search />
            </button>
            <UserAction cartDisplay="pill" />
          </div>
        </div>

        {/* Thanh search: overlay dưới header (mọi breakpoint), không đẩy nội dung trang */}
        {isSearchOpen && (
          <div
            data-testid="mobile-search-bar"
            className="absolute inset-x-0 top-full flex items-center gap-3 bg-page border-b border-white-300 px-[var(--container-px)] py-3 shadow-card"
          >
            <SearchBox
              variant="mobile"
              autoFocus
              className="flex-1"
              onSubmitted={closeSearch}
              onEscape={closeSearch}
            />
            <button
              type="button"
              onClick={closeSearch}
              className={cn(
                "relative whitespace-nowrap text-[15px] text-dark-500 transition-colors hover:text-ink rounded-md after:absolute after:-inset-3 after:content-['']",
                FOCUS_RING
              )}
            >
              Hủy
            </button>
          </div>
        )}
      </header>

      {/* < lg: hàng danh mục cuộn ngang, nằm NGOÀI header sticky — cuộn đi cùng trang */}
      <div className="lg:hidden border-b border-white-300">
        <div className="container-base">
          <CategoryNavSlot
            categories={categories}
            className="-mx-3 max-w-none"
          />
        </div>
      </div>
    </>
  );
}
