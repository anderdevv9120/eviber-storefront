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

// badge: icon giỏ + chấm đếm (classic) · pill: viền tròn "Giỏ (n)" + nút tài khoản 44px (rosier)
interface UserActionProps {
  cartDisplay?: "badge" | "pill";
}

const PILL_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600";

export default function UserAction({ cartDisplay = "badge" }: UserActionProps) {
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
      {cartDisplay === "pill" ? (
        <div className="flex gap-1 items-center">
          <button
            type="button"
            aria-label="Tài khoản"
            onClick={isLogin ? toggleMenu : navigateToLogin}
            className={`grid place-items-center size-11 rounded-full text-dark-800 hover:text-primary-700 transition-colors ${PILL_FOCUS}`}
          >
            {/* Sprite rounded-user cứng màu Pine (#14655C) — pill dùng icon currentColor theo token */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </svg>
          </button>
          <Link
            href={PATH.CART}
            className={`inline-flex items-center gap-2 min-h-[44px] px-3 sm:px-[18px] border border-dark-800 rounded-full text-sm font-medium text-dark-800 whitespace-nowrap hover:bg-white-300 transition-colors ${PILL_FOCUS}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M5 8h14l-1 13H6L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span>
              Giỏ
              {totalQuantity > 0 && (
                <>
                  {" ("}
                  <span data-testid="cart-badge">
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                  </span>
                  )
                </>
              )}
            </span>
          </Link>
        </div>
      ) : (
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
      )}
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
