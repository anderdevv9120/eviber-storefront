"use client";

import { useMemo, useState } from "react";
import {
  Address,
  Bell,
  CartProfile,
  Ticket,
  User,
  Exit,
} from "@/components/icons";
import { PATH } from "@/constants/paths";
import { logoutServer } from "@/apis/auth";
import { useAppStore } from "@/store/useAppStore";
import { usePathname, useRouter } from "next/navigation";
import FadeWrapper from "@/components/ui/FadeWrapper";
import Link from "next/link";
import { cn } from "@/config/utils";

const categories = [
  { id: 1, name: "Tài khoản của tôi", icon: <User />, path: PATH.MY_ACCOUNT },
  { id: 2, name: "Địa chỉ", icon: <Address />, path: PATH.MY_ADDRESS },
  { id: 3, name: "Thông báo", icon: <Bell />, path: PATH.NOTIFICATION },
  { id: 4, name: "Đơn hàng", icon: <CartProfile />, path: PATH.ORDER },
  { id: 5, name: "Voucher", icon: <Ticket />, path: PATH.VOUCHER },
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
  const clearProfile = useAppStore((s) => s.clearProfile);
  const router = useRouter();
  const pathName = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeCategory = useMemo(
    () =>
      categories.findIndex((category) => pathName.includes(category.path)) + 1,
    [pathName]
  );

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

  const SidebarContent = (
    <div className="w-full">
      {categories.map((category) => (
        <Link
          href={category.path}
          key={category.id}
          onClick={() => {
            closeMenu?.();
          }}
          className={`py-3 cursor-pointer flex items-center gap-2 border-l-2 lg:text-lg md:text-base text-sm border-b border-dark-50  pl-3 w-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-100 ${
            activeCategory === category.id
              ? "border-l-primary bg-primary-50"
              : "border-l-white hover:border-l-gray-100"
          }`}
        >
          {category.icon}
          {category.name}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
        className={cn(
          "py-3 cursor-pointer flex items-center gap-2 border-none lg:text-lg md:text-base text-sm pr-20 pl-5 w-full hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-100",
          isLoggingOut && "opacity-60 cursor-not-allowed hover:bg-white"
        )}
      >
        <Exit className="text-red-300" />
        <span className="font-medium">
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </span>
      </button>
    </div>
  );

  if (isDropdown) {
    return (
      <FadeWrapper
        isVisible={isMenuOpen!}
        className="absolute z-50 bg-white top-14 md:top-12 right-0 rounded-lg shadow-xl w-64 md:w-72"
        timeAnimation={400}
      >
        <div className="">{SidebarContent}</div>
      </FadeWrapper>
    );
  }

  return (
    <div className="flex-col hidden xl:block">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 xl:my-0 lg:my-10 my-0 p-4">
        <h3 className="py-3 text-xl px-4 font-medium">Danh mục</h3>
        {SidebarContent}
      </div>
    </div>
  );
};

export default UserSidebar;
