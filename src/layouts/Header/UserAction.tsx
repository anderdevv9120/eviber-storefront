"use client";

import { useRef, useState } from "react";
import { CartShopping, RoundedUser } from "@/components/icons";
import { PATH } from "@/constants/paths";
import { useAppStore } from "@/store/useAppStore";
import UserSidebar from "@/components/ui/UserSidebar";
import useClickOutside from "@/hooks/useClickOutside";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserAction() {
  const { profile } = useAppStore();
  const isLogin = !!profile._id;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useClickOutside(dropdownRef, closeMenu);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const navigateToLogin = () => {
    router.push(PATH.LOGIN);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex gap-5 items-center">
        <Link
          className="relative flex flex-col items-center text-dark-600 hover:text-primary-700 transition-colors"
          href={PATH.CART}
          aria-label="Giỏ hàng"
        >
          {/* Badge số lượng cart: để phase 3 */}
          <CartShopping />
        </Link>
        <RoundedUser
          onClick={isLogin ? toggleMenu : navigateToLogin}
          className="text-dark-600 hover:text-primary-700 transition-colors w-6 h-6 ml-2 mt-0 cursor-pointer"
        />
      </div>
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
