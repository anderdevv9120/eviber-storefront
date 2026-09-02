"use client";

import { useEffect, useRef, useState } from "react";
import { CartShopping, RoundedUser } from "@/components/icons";
import { PATH } from "@/constants/paths";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import UserSidebar from "@/components/ui/UserSidebar";
import useClickOutside from "@/hooks/useClickOutside";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserAction() {
  const profileId = useAppStore((s) => s.profile._id);
  const isLogin = !!profileId;
  const totalQuantity = useCartStore((s) => s.cart?.totalQuantity ?? 0);
  const fetchCart = useCartStore((s) => s.fetchCart);

  // Refetch theo danh tính: chạy khi mount và mỗi khi profile._id đổi (login,
  // logout, kể cả interceptor clearProfile khi refresh fail) — một điểm duy nhất
  // thay cho các hook rải ở LoginForm/UserSidebar. force: identity đổi cần data
  // MỚI HƠN request nền đang bay (Bearer mới), không được join dedupe
  useEffect(() => {
    fetchCart(true);
  }, [profileId, fetchCart]);
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
          <CartShopping />
          {totalQuantity > 0 && (
            <span
              data-testid="cart-badge"
              className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-3.5 h-3.5 px-[3px] rounded-full bg-primary text-white text-[9px] font-bold leading-none"
            >
              {totalQuantity > 9 ? "9+" : totalQuantity}
            </span>
          )}
        </Link>
        <RoundedUser
          onClick={isLogin ? toggleMenu : navigateToLogin}
          className="text-dark-600 hover:text-primary-700 transition-colors w-6 h-6 ml-2 mt-0 cursor-pointer"
        />
      </div>
      <UserSidebar
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
        isDropdown={true}
      />
    </div>
  );
}
