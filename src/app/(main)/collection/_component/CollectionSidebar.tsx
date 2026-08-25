"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/config/utils";
import { XMark } from "@/components/icons";
import Button from "@/components/ui/Button";
import Accordion from "@/components/ui/Accordion";
import Checkbox from "@/components/ui/Checkbox";
import FilterPrice from "@/components/ui/FilterPrice";
import useFilterCollectionStore from "@/store/useFilterCollectionStore";
import useClickOutside from "@/hooks/useClickOutside";
import { useIsPc } from "@/hooks/useMediaQuery";
import {
  ICollectionCategoryOption,
  PRICE_CAP,
  PRICE_STEP,
  SIDEBAR_HEADER_CLASS,
} from "./collection.const";

interface CollectionSidebarProps {
  categories: ICollectionCategoryOption[];
  selectedCategories: string[];
  onToggleCategory: (slug: string) => void;
  onPriceChange: (min: number, max: number) => void;
  /** Khoảng giá đang áp từ URL — slider khởi tạo/đồng bộ theo (remount qua key) */
  priceMin: number;
  priceMax: number;
  /** Số kết quả sau lọc — hiển thị ở footer drawer mobile */
  total: number;
  /** Xóa toàn bộ filter — footer drawer dùng khi lọc ra 0 kết quả */
  onClearAll: () => void;
}

export default function CollectionSidebar(props: CollectionSidebarProps) {
  const isShowFilters = useFilterCollectionStore((s) => s.isShowFilters);
  const setIsShowFilters = useFilterCollectionStore((s) => s.setIsShowFilters);
  const drawerRef = useRef<HTMLDivElement>(null);

  useClickOutside(drawerRef, () => setIsShowFilters(false));

  // Khóa scroll trang nền khi drawer mở — không thì vuốt trong drawer là trang trôi
  useEffect(() => {
    if (!isShowFilters) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isShowFilters]);

  // Cờ isShowFilters là store GLOBAL nên phải tự dọn:
  // - resize/xoay lên ≥lg khi drawer mở → drawer bị lg:hidden nhưng cờ còn true
  //   giữ body khóa scroll mà không còn UI để đóng → đóng khi lên desktop
  // - rời trang lúc cờ còn true → quay lại drawer tự bật → reset khi unmount
  const isPc = useIsPc();
  useEffect(() => {
    if (isPc) setIsShowFilters(false);
  }, [isPc, setIsShowFilters]);
  useEffect(() => {
    return () => setIsShowFilters(false);
  }, [setIsShowFilters]);

  return (
    <>
      {/* Desktop — sticky để cột trái không thành khoảng trống khi scroll grid dài;
          top-24 > header fixed 78px, không thì header đè mất tiêu đề khi cuộn lên */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile drawer — z-[60] phủ cả header fixed (header z-50, cùng nấc là icon cart vẫn bấm được).
          Scrim fade riêng, panel trượt riêng; đóng xong mới invisible (visibility đợi hết transition)
          để phần tử off-screen không nhận focus bàn phím */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[60] transition-all duration-300",
          isShowFilters ? "visible" : "invisible"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-dark-overlay transition-opacity duration-300",
            isShowFilters ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          ref={drawerRef}
          className={cn(
            "relative bg-white h-full w-72 shadow-lg flex flex-col transition-transform duration-300",
            isShowFilters ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex justify-between items-center p-4 pb-3 border-b border-white-300">
            <span className="font-bold text-lg">Bộ lọc</span>
            <button
              type="button"
              aria-label="Đóng bộ lọc"
              className="p-3 -m-3 text-dark-500 hover:text-dark-800 transition-colors"
              onClick={() => setIsShowFilters(false)}
            >
              <XMark />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4">
            <SidebarContent {...props} />
          </div>

          {/* Điểm kết thúc tự nhiên của flow lọc + feedback số kết quả (filter vẫn áp tức thì);
              0 kết quả → lối thoát tại chỗ thay vì mời "Xem 0 sản phẩm" */}
          <div className="p-4 border-t border-white-300">
            {props.total === 0 ? (
              <>
                <p className="text-sm text-dark-400 text-center mb-2.5">
                  Không có sản phẩm khớp bộ lọc
                </p>
                <Button className="w-full" onClick={props.onClearAll}>
                  Xóa bộ lọc
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={() => setIsShowFilters(false)}
              >
                Xem {props.total} sản phẩm
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const SidebarContent = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onPriceChange,
  priceMin,
  priceMax,
}: CollectionSidebarProps) => {
  return (
    <div>
      <Accordion
        headerTitle="Danh mục"
        headerClassName={SIDEBAR_HEADER_CLASS}
        className="mb-0 border-b border-white-300 py-4"
      >
        <div className="flex flex-col gap-1 pt-2">
          {categories.map((category) => {
            const isChecked = selectedCategories.includes(category.slug);
            return (
              <Checkbox
                key={category.slug}
                className="w-full py-1.5"
                label={category.name}
                labelClassName={cn(
                  "flex-1 text-sm text-dark-700 transition-colors hover:text-dark-800",
                  // Item đang lọc phải scan được ngay trong danh sách
                  isChecked ? "font-semibold text-dark-800" : "font-medium"
                )}
                checked={isChecked}
                onChange={() => onToggleCategory(category.slug)}
              />
            );
          })}
        </div>
      </Accordion>

      {/* key theo giá trị URL: URL đổi từ ngoài (back/forward, chip, xóa lọc)
          → remount slider về đúng giá trị; mount echo onChange được guard ở container */}
      <FilterPrice
        key={`${priceMin}-${priceMax}`}
        title="Khoảng giá"
        headerClassName={SIDEBAR_HEADER_CLASS}
        className="mb-0 py-4 border-b-0"
        maxPrice={PRICE_CAP}
        step={PRICE_STEP}
        showInputs={false}
        initialMin={priceMin}
        initialMax={priceMax}
        onChange={onPriceChange}
      />
    </div>
  );
};
