"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DownAngle } from "@/components/icons";
import { PATH } from "@/constants/paths";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/config/utils";
import { ICategoryItem } from "@/@types/Home.type";

// Categories fetch ở (main)/layout.tsx (server) rồi truyền xuống qua Header
const CategoryDropdown = ({ categories }: { categories: ICategoryItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex gap-1 items-center font-semibold hover:text-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 rounded-md px-1"
      >
        Sản phẩm
        <DownAngle
          className={cn(
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-white shadow-lg border border-white-300 py-2 z-50">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={PATH.COLLECTION}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              {category.name}
            </Link>
          ))}
          <div className="border-t border-white-300 mt-2 pt-2">
            <Link
              href={PATH.COLLECTION}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
            >
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
