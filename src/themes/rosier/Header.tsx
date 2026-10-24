"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronLeft } from "@/components/icons";
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

// Clip-layer bo tròn giống nav để fade không tràn ra nền trang ngoài mép pill;
// chỉ khi nav bị co (đủ nội dung) nó mới hẹp hơn wrapper — lúc đó cả 2 fade đều ẩn nên không lộ
const SCROLL_FADE = "absolute inset-y-0 w-6 transition-opacity duration-200";

function CategoryNav({
  categories,
  activeSlug,
  className,
}: ThemeHeaderProps & { activeSlug: string | null; className?: string }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const scrollAnim = useRef<number | null>(null);
  // Side còn cuộn được — quyết định fade nào hiện (đo scrollLeft/scrollWidth thật, không đoán từ số mục)
  const [scrollable, setScrollable] = useState({ left: false, right: false });

  const updateScrollable = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const next = {
      left: el.scrollLeft > 1,
      right: el.scrollLeft < maxScroll - 1,
    };
    // Scroll event nổ theo từng frame khi animate — giữ nguyên reference nếu không đổi để tránh re-render
    setScrollable((prev) =>
      prev.left === next.left && prev.right === next.right ? prev : next
    );
  }, []);

  // Tự điều khiển animation thay vì behavior:"smooth" — chế độ đó bị bỏ qua khi OS/trình duyệt
  // bật reduce-motion hoặc tắt smooth scrolling, sẽ thành nhảy tức thì. Ease-out cho cảm giác mượt.
  const scrollByStep = (direction: -1 | 1) => {
    const el = navRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const from = el.scrollLeft;
    const desired = from + direction * el.clientWidth * 0.8;
    // Đích đến chọn trùng mép một pill: khi bật lại snap sau animation, Chrome re-snap về
    // snap point gần nhất — nếu đích không trùng mép pill sẽ bị kéo thêm, giật ở cuối animation
    const firstChild = el.children[0] as HTMLElement | undefined;
    const snapPoints = firstChild
      ? Array.from(el.children, (c) => (c as HTMLElement).offsetLeft - firstChild.offsetLeft)
      : [];
    const snappedTarget = snapPoints.reduce(
      (best, p) => (Math.abs(p - desired) < Math.abs(best - desired) ? p : best),
      desired
    );
    const to = Math.min(Math.max(snappedTarget, 0), maxScroll);
    if (Math.abs(to - from) < 1) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = to;
      return;
    }

    if (scrollAnim.current !== null) cancelAnimationFrame(scrollAnim.current);
    // Bắt buộc tắt snap trong lúc animate: Chrome re-snap sau MỖI lần gán scrollLeft
    // (thử nghiệm: gán 97 → bị kéo về 0) — giữ snap sẽ làm animation giật từng bước
    el.style.scrollSnapType = "none";
    const duration = 400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.scrollLeft = from + (to - from) * eased;
      if (progress < 1) {
        scrollAnim.current = requestAnimationFrame(tick);
      } else {
        scrollAnim.current = null;
        el.style.scrollSnapType = ""; // trả snap về giá trị từ class Tailwind
      }
    };
    scrollAnim.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    updateScrollable();
    const el = navRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollable, { passive: true });
    // Số lượng category / font load xong thay đổi scrollWidth — ResizeObserver bắt được cả hai
    const observer = new ResizeObserver(updateScrollable);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollable);
      observer.disconnect();
      if (scrollAnim.current !== null) cancelAnimationFrame(scrollAnim.current);
    };
  }, [updateScrollable]);

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
    <div className={cn("relative max-w-full", className)}>
      <nav
        ref={navRef}
        aria-label="Danh mục"
        className="bg-white-300 rounded-full p-1 flex gap-1 overflow-x-auto scroll-px-1 snap-x scrollbar-hide max-w-full text-sm font-medium"
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
              "px-[18px] min-h-11 flex items-center rounded-full whitespace-nowrap snap-start text-dark-800 transition-colors hover:bg-page/60",
              FOCUS_RING,
              item.active && "bg-page hover:bg-page"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full overflow-hidden"
      >
        <div
          data-testid="nav-fade-left"
          className={cn(
            SCROLL_FADE,
            "left-0 bg-gradient-to-r from-white-300 to-transparent",
            scrollable.left ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          data-testid="nav-fade-right"
          className={cn(
            SCROLL_FADE,
            "right-0 bg-gradient-to-l from-white-300 to-transparent",
            scrollable.right ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Halo sau chevron: làm mờ + phai chữ pill chui qua bên dưới để nút không "đè" lên mục bên cạnh.
            Đặt trong lớp clip để halo tròn không tràn ra nền trang ngoài mép pill */}
        {scrollable.left && (
          <div
            aria-hidden
            className="absolute -left-1 top-1/2 size-14 -translate-y-1/2 rounded-full backdrop-blur-[2px] bg-[radial-gradient(closest-side,rgb(var(--color-white-300)/0.9),transparent)]"
          />
        )}
        {scrollable.right && (
          <div
            aria-hidden
            className="absolute -right-1 top-1/2 size-14 -translate-y-1/2 rounded-full backdrop-blur-[2px] bg-[radial-gradient(closest-side,rgb(var(--color-white-300)/0.9),transparent)]"
          />
        )}
      </div>
      {/* Chevron đè lên fade: fade gợi ý còn mục, chevron là chỗ bấm để cuộn —
          chỉ render khi phía đó còn mục ẩn để keyboard không gặp nút vô hình.
          after:-inset-2 nới vùng bấm ra quanh nút (56px) để không bấm nhầm sang pill kế bên */}
      {scrollable.left && (
        <button
          type="button"
          aria-label="Cuộn danh mục sang trái"
          onClick={() => scrollByStep(-1)}
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center size-10 rounded-full bg-page text-dark-800 shadow-card transition-colors hover:text-primary-700",
            "after:content-[''] after:absolute after:-inset-2 after:rounded-full",
            FOCUS_RING
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {scrollable.right && (
        <button
          type="button"
          aria-label="Cuộn danh mục sang phải"
          onClick={() => scrollByStep(1)}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center size-10 rounded-full bg-page text-dark-800 shadow-card transition-colors hover:text-primary-700",
            "after:content-[''] after:absolute after:-inset-2 after:rounded-full",
            FOCUS_RING
          )}
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      )}
    </div>
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
