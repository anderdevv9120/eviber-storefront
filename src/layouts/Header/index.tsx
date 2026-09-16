"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Logo } from "@/components/icons";
import HeaderNav from "./HeaderNav";
import UserAction from "./UserAction";
import CategoryDropdown from "./CategoryDropdown";
import SearchBox from "./SearchBox";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import { ICategoryItem } from "@/@types/Home.type";

// "Liên hệ" chưa có trang riêng — neo xuống khối liên hệ ở Footer (id="lien-he")
const CONTACT_ANCHOR = `${PATH.HOME}#lien-he`;

const mobileMenus = [
  { name: "Trang chủ", link: PATH.HOME },
  { name: "Sản phẩm", link: PATH.COLLECTION },
  { name: "Liên hệ", link: CONTACT_ANCHOR },
];

const SHOW_DELTA = -6;
const HIDE_DELTA = 6;
const PIN_AT_TOP = 64;

interface HeaderProps {
  categories: ICategoryItem[];
}

export default function Header({ categories }: HeaderProps) {
  const lastY = useRef(0);
  const ticking = useRef(false);

  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const closeMobileSearch = () => setIsMobileSearchOpen(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      setScrolled(y > 8);

      if (y <= PIN_AT_TOP) {
        setVisible(true);
        lastY.current = y;
        return;
      }

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (delta > HIDE_DELTA) setVisible(false);
          if (delta < SHOW_DELTA) setVisible(true);

          lastY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 will-change-transform border-b border-white-500",
        // Đang search (thanh mobile mở / panel gợi ý mở) thì header không được trốn theo cuộn
        visible || isMobileSearchOpen || isSuggestionOpen
          ? "translate-y-0"
          : "-translate-y-full",
        scrolled ? "bg-white/80 backdrop-blur-sm" : "bg-white"
      )}
    >
      <div className="hidden py-4 xl:block">
        <div className="container-base grid grid-cols-[1fr_auto_1fr] items-center">
          <nav className="flex gap-6 items-center">
            <Link
              href={PATH.HOME}
              className="font-semibold hover:text-primary-700 transition-colors"
            >
              Trang chủ
            </Link>
            <CategoryDropdown categories={categories} />
            <Link
              href={CONTACT_ANCHOR}
              className="font-semibold hover:text-primary-700 transition-colors"
            >
              Liên hệ
            </Link>
          </nav>

          <Link href={PATH.HOME} aria-label="CLOTHES — về trang chủ">
            <Logo className="text-dark-800" />
          </Link>

          <div className="flex gap-5 items-center justify-end">
            <SearchBox
              className="xl:w-[230px] 2xl:w-[320px]"
              onOpenChange={setIsSuggestionOpen}
            />
            <UserAction />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] py-5 px-4 items-center xl:hidden">
        <HeaderNav menus={mobileMenus} />
        <Link href={PATH.HOME} aria-label="CLOTHES — về trang chủ">
          <Logo className="text-dark-800" />
        </Link>
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            aria-label={isMobileSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
            aria-expanded={isMobileSearchOpen}
            onClick={() => setIsMobileSearchOpen((open) => !open)}
            className={cn(
              "relative flex items-center transition-colors hover:text-primary-700 after:absolute after:-inset-3 after:content-['']",
              isMobileSearchOpen ? "text-primary-700" : "text-dark-600"
            )}
          >
            <Search />
          </button>
          <UserAction />
        </div>
      </div>

      {/* Thanh search mobile: overlay dưới header, không đẩy nội dung trang */}
      {isMobileSearchOpen && (
        <div
          data-testid="mobile-search-bar"
          className="absolute inset-x-0 top-full flex items-center gap-3 border-b border-white-500 bg-white px-4 py-3 shadow-card xl:hidden"
        >
          <SearchBox
            variant="mobile"
            autoFocus
            className="flex-1"
            onSubmitted={closeMobileSearch}
            onEscape={closeMobileSearch}
          />
          <button
            type="button"
            onClick={closeMobileSearch}
            className="relative whitespace-nowrap text-[15px] text-dark-500 transition-colors hover:text-dark-800 after:absolute after:-inset-3 after:content-['']"
          >
            Hủy
          </button>
        </div>
      )}
    </header>
  );
}
