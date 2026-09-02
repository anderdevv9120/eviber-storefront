"use client";

import { useEffect, useMemo, useState } from "react";
import {
  UserOutline,
  MapPin,
  BellOutline,
  PackageBox,
  GiftBox,
  LogoutOutline,
} from "@/components/icons";
import { PATH } from "@/constants/paths";
import { logoutServer } from "@/apis/auth";
import { useAppStore } from "@/store/useAppStore";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/config/utils";

// Khung panel dùng chung cho sidebar (xl+) và dropdown icon user trên Header
const PANEL_CLASS =
  "w-72 rounded-lg border border-white-300 bg-white p-3 pb-1 pt-5";

const categories = [
  {
    id: 1,
    name: "Tài khoản của tôi",
    icon: <UserOutline />,
    path: PATH.MY_ACCOUNT,
  },
  { id: 2, name: "Địa chỉ", icon: <MapPin />, path: PATH.MY_ADDRESS },
  { id: 3, name: "Thông báo", icon: <BellOutline />, path: PATH.NOTIFICATION },
  { id: 4, name: "Đơn hàng", icon: <PackageBox />, path: PATH.ORDER },
  { id: 5, name: "Voucher", icon: <GiftBox />, path: PATH.VOUCHER },
];

interface IUserSidebarProps {
  isDropdown?: boolean;
  isMenuOpen?: boolean;
  closeMenu?: () => void;
}

const UserSidebar = ({
  isDropdown = false,
  isMenuOpen,
  closeMenu,
}: IUserSidebarProps) => {
  const profile = useAppStore((s) => s.profile);
  const clearProfile = useAppStore((s) => s.clearProfile);
  const router = useRouter();
  const pathName = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Store persist chỉ có dữ liệu ở client — in thẳng ra sẽ lệch với HTML server render
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const activeCategory = useMemo(
    () =>
      categories.findIndex((category) => pathName.includes(category.path)) + 1,
    [pathName]
  );

  const fullName = isMounted
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
      "Tài khoản"
    : "";
  const initials = isMounted
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
      "?"
    : "";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutServer();
    } catch {
      // Route handler cùng origin hiếm khi fail — lỗi mạng thì vẫn dọn phiên cục bộ bên dưới
    }
    clearProfile();
    closeMenu?.();
    router.push(PATH.LOGIN);
    setIsLoggingOut(false);
  };

  const identityBlock = (
    <div className="flex items-center gap-3 px-2 pb-4">
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 ring-4 ring-primary-50">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{fullName}</p>
        <p className="truncate text-xs text-dark-400">{profile.email}</p>
      </div>
    </div>
  );

  const navLinks = categories.map((category) => (
    <Link
      href={category.path}
      key={category.id}
      onClick={() => {
        closeMenu?.();
      }}
      className={cn(
        "relative mb-0.5 flex h-11 items-center gap-2 rounded-md px-2.5 text-sm text-dark-500 transition-colors hover:bg-white-100 hover:text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-100",
        activeCategory === category.id &&
          "bg-primary-50 font-semibold text-primary-700 before:absolute before:-left-3 before:bottom-2 before:top-2 before:w-[3px] before:rounded-r-full before:bg-primary"
      )}
    >
      {category.icon}
      {category.name}
    </Link>
  ));

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-busy={isLoggingOut}
      className={cn(
        "-mx-3 mt-2 flex h-11 w-[calc(100%+24px)] items-center gap-2 border-t border-white-300 px-5 text-sm text-dark-400 transition-colors hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-100",
        isLoggingOut && "cursor-not-allowed opacity-60 hover:text-dark-400"
      )}
    >
      <LogoutOutline />
      <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
    </button>
  );

  const panelContent = (
    <>
      {identityBlock}
      <hr className="-mx-3 mb-2 border-white-300" />
      <nav aria-label={isDropdown ? "Tài khoản (menu)" : "Tài khoản"}>
        {navLinks}
      </nav>
      {logoutButton}
    </>
  );

  if (isDropdown) {
    // KHÔNG dùng FadeWrapper: nó bọc children trong lớp overflow-hidden (cắt notch
    // active tràn ra mép panel) và thêm nhịp gap/padding riêng — dropdown sẽ lệch
    // khỏi sidebar. Tự animate để 2 nơi dùng chung đúng một khối panel.
    return (
      <div
        className={cn(
          PANEL_CLASS,
          "absolute right-0 top-14 z-50 shadow-card-hover transition-all duration-200 md:top-12",
          isMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        )}
      >
        {panelContent}
      </div>
    );
  }

  // < xl không render panel — điều hướng cụm /user qua dropdown icon user trên Header (đã chốt)
  return (
    <aside
      className={cn(
        PANEL_CLASS,
        "hidden flex-none self-start shadow-card xl:block"
      )}
    >
      {panelContent}
    </aside>
  );
};

export default UserSidebar;
