"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchBox from "@/layouts/Header/SearchBox";
import UserSidebar from "@/components/ui/UserSidebar";
import useClickOutside from "@/hooks/useClickOutside";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { PATH } from "@/constants/paths";
import { cn } from "@/config/utils";
import type { ICategoryItem } from "@/@types/Home.type";
import type { ThemeHeaderProps } from "@/themes/types";
import Wordmark from "./Wordmark";
import {
  LINKS_AFTER_COLLECTION,
  LINKS_BEFORE_COLLECTION,
  activeCollectionKey,
  categoryHref,
} from "./nav";

// Nấc nav = mockup @media (max-width:1100px): dưới đó ẩn nav, hiện burger. Tailwind cần class literal
// nên mọi chỗ viết thẳng `min-[1100px]:` — đổi nấc thì đổi cả DESKTOP_MQ.
const DESKTOP_MQ = "(min-width: 1100px)";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600";

// < 360px vùng bấm 40px (vẫn > 24px AA) để burger + logo + 3 icon vừa 320px
const ICON_BUTTON = cn(
  "relative grid place-items-center size-10 min-[360px]:size-11 rounded-full text-dark-800 transition-colors hover:text-primary-700",
  FOCUS_RING
);

// Mockup .nav a: in hoa 14/600, gạch chân accent trượt ra khi hover
const NAV_LINK = cn(
  "relative flex items-center min-h-11 whitespace-nowrap rounded-sm text-dark-800 transition-colors hover:text-primary-700",
  "after:absolute after:inset-x-0 after:bottom-1.5 after:h-[1.5px] after:bg-primary-700 after:origin-left after:scale-x-0 after:transition-transform after:content-[''] hover:after:scale-x-100",
  FOCUS_RING
);

const DRAWER_LINK = cn(
  "flex min-h-12 items-center border-b border-white-200 text-dark-800 transition-colors hover:text-primary-700",
  FOCUS_RING,
  "focus-visible:ring-inset"
);

// Glyph mockup (stroke 1.6, currentColor) — sprite SvgIcon cứng màu nên không dùng
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className="size-[22px]"
    >
      {children}
    </svg>
  );
}

type CategoryListProps = {
  categories: ICategoryItem[];
  linkClassName: string;
  onNavigate: () => void;
};

function CategoryItems({
  categories,
  linkClassName,
  onNavigate,
  activeKey,
}: CategoryListProps & { activeKey: string | null }) {
  const items = [
    {
      key: "all",
      name: "Tất cả sản phẩm",
      href: PATH.COLLECTION,
      active: activeKey === "",
    },
    ...categories.map((category) => ({
      key: category._id,
      name: category.name,
      href: categoryHref(category.slug),
      active: !!category.slug && category.slug === activeKey,
    })),
  ];
  return (
    <>
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            onClick={onNavigate}
            className={linkClassName}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </>
  );
}

function CategoryItemsFromUrl(props: CategoryListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <CategoryItems
      {...props}
      activeKey={activeCollectionKey(pathname, searchParams.get("category"))}
    />
  );
}

// Bọc Suspense (như SearchBox): useSearchParams ép CSR bail-out chỉ trong boundary này,
// trang ISR chứa Header không bị kéo theo — fallback = danh sách không có mục active
function CategoryList(props: CategoryListProps) {
  return (
    <Suspense fallback={<CategoryItems {...props} activeKey={null} />}>
      <CategoryItemsFromUrl {...props} />
    </Suspense>
  );
}

// Disclosure (không phải menu ARIA): nút aria-expanded + danh sách link, Tab đi qua từng mục.
// Chuột: hover mở ("hover"), click ghim ("pinned"); bàn phím/chạm: click bật/tắt.
function CollectionMenu({ categories }: ThemeHeaderProps) {
  const [open, setOpen] = useState<false | "hover" | "pinned">(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close);

  // Đổi route (kể cả back/forward) → đóng; set state lúc render thay vì effect
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setOpen((o) => o || "hover");
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse")
          setOpen((o) => (o === "hover" ? false : o));
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={!!open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => (o === "pinned" ? false : "pinned"))}
        className={cn(
          NAV_LINK,
          "gap-1 uppercase",
          open && "text-primary-700 after:scale-x-100"
        )}
      >
        Bộ sưu tập
        <span
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          ▾
        </span>
      </button>
      {/* pt-1.5 trong suốt nối nút với panel: chuột đi xuống không rơi khỏi vùng hover */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-1/2 top-full z-10 -translate-x-1/2 pt-1.5"
      >
        <ul className="min-w-56 max-h-[calc(100vh-88px)] overflow-y-auto rounded-md border border-white-200 bg-page py-2 shadow-card normal-case tracking-normal">
          <CategoryList
            categories={categories}
            onNavigate={close}
            linkClassName={cn(
              "block whitespace-nowrap px-5 py-2.5 text-sm font-medium text-dark-800 transition-colors hover:bg-white-100 hover:text-primary-700 aria-[current=page]:text-primary-700",
              FOCUS_RING,
              "focus-visible:ring-inset"
            )}
          />
        </ul>
      </div>
    </div>
  );
}

function MobileDrawer({
  id,
  open,
  onClose,
  categories,
}: ThemeHeaderProps & {
  id: string;
  open: boolean;
  onClose: (restoreFocus: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const subId = useId();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    // Xoay/kéo rộng qua nấc desktop: drawer ẩn bằng CSS nhưng khóa cuộn còn — đóng hẳn
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) onClose(false);
    };
    mq.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = "";
      mq.removeEventListener("change", onChange);
    };
  }, [open, onClose]);

  // Giữ Tab trong panel (aria-modal không tự chặn focus)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose(true);
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>("a[href], button")
    ).filter((el) => el.getClientRects().length > 0);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  const navigate = () => onClose(false);

  return (
    <div
      id={id}
      hidden={!open}
      className="fixed inset-0 z-[60] min-[1100px]:hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-dark-900/40"
        onClick={() => onClose(true)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 left-0 flex w-[min(360px,88vw)] flex-col overflow-y-auto overscroll-contain bg-page shadow-card-hover"
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-white-200 pl-[var(--container-px)] pr-2">
          <Wordmark className="text-[24px] tracking-[.04em] text-dark-800" />
          <button
            ref={closeRef}
            type="button"
            aria-label="Đóng menu"
            onClick={() => onClose(true)}
            className={ICON_BUTTON}
          >
            <Glyph>
              <path d="M6 6l12 12M18 6 6 18" />
            </Glyph>
          </button>
        </div>
        <nav
          aria-label="Menu chính"
          className="px-[var(--container-px)] pb-6 text-[15px] font-semibold uppercase tracking-[.02em]"
        >
          <ul>
            {LINKS_BEFORE_COLLECTION.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={navigate}
                  className={DRAWER_LINK}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-expanded={collectionOpen}
                aria-controls={subId}
                onClick={() => setCollectionOpen((o) => !o)}
                className={cn(DRAWER_LINK, "w-full justify-between uppercase")}
              >
                Bộ sưu tập
                <span
                  aria-hidden
                  className={cn(
                    "transition-transform",
                    collectionOpen && "rotate-180"
                  )}
                >
                  ▾
                </span>
              </button>
              <ul
                id={subId}
                hidden={!collectionOpen}
                className="border-b border-white-200 py-1 normal-case tracking-normal"
              >
                <CategoryList
                  categories={categories}
                  onNavigate={navigate}
                  linkClassName={cn(
                    "flex min-h-11 items-center rounded-sm pl-4 text-[15px] font-medium text-dark-500 transition-colors hover:text-primary-700 aria-[current=page]:text-primary-700",
                    FOCUS_RING,
                    "focus-visible:ring-inset"
                  )}
                />
              </ul>
            </li>
            {LINKS_AFTER_COLLECTION.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={navigate}
                  className={DRAWER_LINK}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

// Thay UserAction: mockup cần thứ tự tài khoản · tìm kiếm · túi + badge, icon tài khoản bấm được bằng phím
// (bản "badge" của UserAction là svg không focus được, bản "pill" là chữ "Giỏ (n)")
function HeaderIcons({
  isSearchOpen,
  onToggleSearch,
}: {
  isSearchOpen: boolean;
  onToggleSearch: () => void;
}) {
  const profileId = useAppStore((s) => s.profile._id);
  const isLogin = !!profileId;
  const totalQuantity = useCartStore((s) => s.cart?.totalQuantity ?? 0);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  useClickOutside(rootRef, closeMenu);

  // Như UserAction (lua không render nó): refetch giỏ theo danh tính — mount, login, logout
  useEffect(() => {
    fetchCart(true);
  }, [profileId, fetchCart]);

  return (
    // -mr: glyph túi chạm mép container như mockup; vùng bấm + badge vẫn trong padding container
    <div
      ref={rootRef}
      className="relative -mr-2.5 flex items-center justify-self-end min-[360px]:gap-0.5"
    >
      <button
        type="button"
        aria-label="Tài khoản"
        onClick={
          isLogin
            ? () => setIsMenuOpen((open) => !open)
            : () => router.push(PATH.LOGIN)
        }
        className={ICON_BUTTON}
      >
        <Glyph>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </Glyph>
      </button>
      <button
        type="button"
        aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
        aria-expanded={isSearchOpen}
        onClick={onToggleSearch}
        className={cn(ICON_BUTTON, isSearchOpen && "text-primary-700")}
      >
        <Glyph>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </Glyph>
      </button>
      <Link
        href={PATH.CART}
        aria-label={
          totalQuantity > 0 ? `Giỏ hàng, ${totalQuantity} sản phẩm` : "Giỏ hàng"
        }
        className={ICON_BUTTON}
      >
        <span className="relative">
          <Glyph>
            <path d="M5 8h14l-1 13H6z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </Glyph>
          {/* Mockup .cart-count: 17px, chữ trắng 10/700 trên accent (7.76:1) */}
          {totalQuantity > 0 && (
            <span
              data-testid="cart-badge"
              className="absolute -right-1.5 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-primary-700 px-1 text-[10px] font-bold leading-none text-white"
            >
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </span>
          )}
        </span>
      </Link>
      {isLogin && (
        <UserSidebar
          isMenuOpen={isMenuOpen}
          closeMenu={closeMenu}
          isDropdown={true}
        />
      )}
    </div>
  );
}

export default function Header({ categories }: ThemeHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeSearch = () => setIsSearchOpen(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerId = useId();

  const closeDrawer = useCallback((restoreFocus: boolean) => {
    setIsDrawerOpen(false);
    if (restoreFocus) burgerRef.current?.focus();
  }, []);

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsDrawerOpen(false);
  }

  return (
    <>
      {/* Mockup .header: nền page mờ nhẹ, hairline dưới, cao 64px; grid 1fr auto 1fr (logo · nav · icon),
          dưới nấc nav: burger · logo giữa · icon */}
      <header className="sticky top-0 z-50 bg-page/95 backdrop-blur-md border-b border-white-200">
        <div className="container-base h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 min-[1100px]:grid-cols-[1fr_auto_1fr] min-[1100px]:gap-x-8">
          <button
            ref={burgerRef}
            type="button"
            aria-label="Mở menu"
            aria-expanded={isDrawerOpen}
            aria-controls={drawerId}
            onClick={() => setIsDrawerOpen(true)}
            className={cn(ICON_BUTTON, "-ml-2.5 min-[1100px]:hidden")}
          >
            <Glyph>
              <path d="M3 7h18M3 12h18M3 17h18" />
            </Glyph>
          </button>

          <Link
            href={PATH.HOME}
            aria-label="CLOTHES — về trang chủ"
            className={cn(
              "inline-flex justify-self-center rounded-md text-dark-800 min-[1100px]:justify-self-start",
              FOCUS_RING
            )}
          >
            {/* < 360px: wordmark nhỏ lại để burger + 3 icon + badge không tràn viewport 320px */}
            <Wordmark className="text-[22px] min-[360px]:text-[26px] tracking-[.04em]" />
          </Link>

          <nav
            aria-label="Chính"
            className="hidden min-[1100px]:block text-sm font-semibold uppercase tracking-[.02em]"
          >
            <ul className="flex items-center gap-[clamp(20px,2.6vw,44px)]">
              {LINKS_BEFORE_COLLECTION.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={NAV_LINK}>
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <CollectionMenu categories={categories} />
              </li>
              {LINKS_AFTER_COLLECTION.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={NAV_LINK}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <HeaderIcons
            isSearchOpen={isSearchOpen}
            onToggleSearch={() => setIsSearchOpen((open) => !open)}
          />
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

      <MobileDrawer
        id={drawerId}
        open={isDrawerOpen}
        onClose={closeDrawer}
        categories={categories}
      />
    </>
  );
}
