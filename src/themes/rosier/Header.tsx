"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "@/components/icons";
import UserAction from "@/layouts/Header/UserAction";
import SearchBox from "@/layouts/Header/SearchBox";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import type { ICategoryItem } from "@/@types/Home.type";
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
    ...categories.map((category: ICategoryItem) => ({
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
        "bg-white-300 rounded-full p-1 flex gap-1 overflow-x-auto scroll-px-1 scrollbar-hide max-w-full text-sm font-medium",
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          // Chrome không tự cuộn pill bị che một phần khi Tab tới — kéo vào khung nav
          onFocus={(e) =>
            e.currentTarget.scrollIntoView({
              block: "nearest",
              inline: "nearest",
            })
          }
          className={cn(
            "px-[18px] min-h-11 flex items-center rounded-full whitespace-nowrap text-dark-800 transition-colors hover:bg-page/60",
            FOCUS_RING,
            item.active && "bg-page hover:bg-page"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

// Tách riêng + bọc Suspense (như SearchBox): useSearchParams ép CSR bail-out chỉ trong
// boundary này, trang ISR chứa Header không bị kéo theo — fallback = nav không có pill active
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
      <header className="sticky top-0 z-50 bg-page">
        <div className="container-base py-[18px] flex flex-wrap items-center justify-between gap-x-3 gap-y-3 sm:gap-x-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Link
            href={PATH.HOME}
            aria-label="CLOTHES — về trang chủ"
            className={cn("inline-flex rounded-md text-dark-800", FOCUS_RING)}
          >
            <Wordmark className="text-[26px] sm:text-[34px]" />
          </Link>

          <div className="hidden lg:flex justify-center min-w-0">
            <CategoryNavSlot categories={categories} />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
              className={cn(
                "grid place-items-center size-11 rounded-full transition-colors hover:text-primary-700",
                FOCUS_RING,
                isSearchOpen ? "text-primary-700" : "text-dark-800"
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
            className="absolute inset-x-0 top-full flex items-center gap-3 bg-page px-[var(--container-px)] py-3 shadow-card"
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
                "relative whitespace-nowrap text-[15px] text-dark-500 transition-colors hover:text-dark-800 rounded-md after:absolute after:-inset-3 after:content-['']",
                FOCUS_RING
              )}
            >
              Hủy
            </button>
          </div>
        )}
      </header>

      {/* < lg: hàng pill nằm NGOÀI header sticky — cuộn đi cùng trang, chỉ hàng logo/icon bám lại.
          Không margin âm kéo lên: header sticky z-50 nền page sẽ đè mất mép trên của pill */}
      <div className="lg:hidden">
        <div className="container-base flex justify-center pb-[18px]">
          <CategoryNavSlot categories={categories} />
        </div>
      </div>
    </>
  );
}
