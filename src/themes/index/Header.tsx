"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "@/components/icons";
import { BRAND } from "@/config/brand";
import { cn } from "@/config/utils";
import { PATH } from "@/constants/paths";
import SearchBox from "@/layouts/Header/SearchBox";
import UserAction from "@/layouts/Header/UserAction";
import type { ThemeHeaderProps } from "@/themes/types";
import Wordmark from "./Wordmark";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset";

function CategoryLinks({
  categories,
  activeSlug,
}: ThemeHeaderProps & { activeSlug: string | null }) {
  return (
    <nav
      aria-label="Danh mục"
      className="flex min-w-0 gap-1 overflow-x-auto scrollbar-hide text-sm"
    >
      {[{ _id: "all", name: "Tất cả", slug: undefined }, ...categories].map(
        (category) => (
          <Link
            key={category._id}
            href={
              category.slug
                ? `${PATH.COLLECTION}?category=${encodeURIComponent(category.slug)}`
                : PATH.COLLECTION
            }
            aria-current={
              category.slug && category.slug === activeSlug ? "page" : undefined
            }
            onFocus={(event) =>
              event.currentTarget.scrollIntoView({
                block: "nearest",
                inline: "nearest",
              })
            }
            className={cn(
              "flex min-h-11 min-w-11 shrink-0 items-center px-2 whitespace-nowrap hover:underline underline-offset-4",
              FOCUS,
              category.slug === activeSlug && "font-bold underline"
            )}
          >
            {category.name}
          </Link>
        )
      )}
      <Link
        href={`${PATH.HOME}#lien-he`}
        className={`flex min-h-11 shrink-0 items-center px-2 whitespace-nowrap hover:underline ${FOCUS}`}
      >
        Liên hệ
      </Link>
    </nav>
  );
}

function CategoryLinksFromUrl(props: ThemeHeaderProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <CategoryLinks
      {...props}
      activeSlug={pathname === PATH.COLLECTION ? params.get("category") : null}
    />
  );
}

export default function Header({ categories }: ThemeHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButton = useRef<HTMLButtonElement>(null);
  const closeSearch = () => {
    setSearchOpen(false);
    searchButton.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-page text-ink">
      <div className="container-base grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="order-3 col-span-2 min-w-0 border-t border-ink/20 xl:order-1 xl:col-span-1 xl:border-0">
          <Suspense
            fallback={
              <CategoryLinks categories={categories} activeSlug={null} />
            }
          >
            <CategoryLinksFromUrl categories={categories} />
          </Suspense>
        </div>
        <Link
          href={PATH.HOME}
          aria-label={`${BRAND.name} — về trang chủ`}
          className={`order-1 flex min-h-[72px] min-w-0 items-center xl:order-2 xl:justify-center ${FOCUS}`}
        >
          <Wordmark className="text-xl sm:text-2xl" />
        </Link>
        <div className="order-2 flex items-center justify-self-end tabular-nums xl:order-3 [&_a]:rounded-none [&_button]:rounded-none">
          <button
            ref={searchButton}
            type="button"
            aria-label={searchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
            aria-expanded={searchOpen}
            aria-controls="index-search"
            onClick={() => setSearchOpen((open) => !open)}
            className={`grid size-11 place-items-center hover:bg-white-100 ${FOCUS}`}
          >
            <Search />
          </button>
          <UserAction cartDisplay="pill" />
        </div>
      </div>
      {searchOpen && (
        <div
          id="index-search"
          data-testid="mobile-search-bar"
          className="absolute inset-x-0 top-full flex items-center gap-3 border-b border-ink bg-page px-[var(--container-px)] py-3"
        >
          <SearchBox
            variant="mobile"
            autoFocus
            className="min-w-0 flex-1"
            onSubmitted={closeSearch}
            onEscape={closeSearch}
          />
          <button
            type="button"
            onClick={closeSearch}
            className={`min-h-11 min-w-11 text-sm ${FOCUS}`}
          >
            Hủy
          </button>
        </div>
      )}
    </header>
  );
}
