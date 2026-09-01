"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { Search, Logo } from "@/components/icons";
import HeaderNav from "./HeaderNav";
import UserAction from "./UserAction";
import CategoryDropdown from "./CategoryDropdown";
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
        visible ? "translate-y-0" : "-translate-y-full",
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
            {/* Ô search decorative — chức năng search thuộc Backlog */}
            <Input
              variant="standard"
              placeholder="Tìm kiếm sản phẩm"
              error=""
              icon={<Search className="text-dark-400" />}
              className="xl:w-[230px] xxl:w-[320px] bg-white/0"
            />
            <UserAction />
          </div>
        </div>
      </div>

      <div className="flex py-5 px-4 justify-between items-center xl:hidden">
        <HeaderNav menus={mobileMenus} />
        <Link href={PATH.HOME} aria-label="CLOTHES — về trang chủ">
          <Logo className="text-dark-800 ml-8" />
        </Link>
        <UserAction />
      </div>
    </header>
  );
}
