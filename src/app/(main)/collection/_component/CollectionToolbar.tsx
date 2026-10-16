"use client";

import Dropdown from "@/components/ui/Dropdown";
import { cn } from "@/config/utils";
import { FilterIcon, XMark } from "@/components/icons";
import useFilterCollectionStore from "@/store/useFilterCollectionStore";
import { SORT_OPTIONS, SortKey } from "./collection.const";

export interface IFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface CollectionToolbarProps {
  total: number;
  chips: IFilterChip[];
  onClearAll: () => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export default function CollectionToolbar({
  total,
  chips,
  onClearAll,
  sort,
  onSortChange,
}: CollectionToolbarProps) {
  const setIsShowFilters = useFilterCollectionStore((s) => s.setIsShowFilters);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="lg:hidden shrink-0 flex items-center gap-2 px-3 h-11 rounded-lg border border-white-600 text-sm font-medium text-dark-600 hover:border-primary transition-colors"
            onClick={() => setIsShowFilters(true)}
          >
            <FilterIcon className="w-4 h-4" />
            Bộ lọc
          </button>

          <span className="shrink-0 whitespace-nowrap text-sm text-dark-500 pr-1.5">
            <b className="font-semibold text-dark-800">{total}</b> sản phẩm
          </span>
        </div>

        {/* Desktop: inline options — đổi sort 1 click, không dropdown (chốt mockup S5) */}
        <div className="hidden md:flex items-center gap-5">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              className={cn(
                "text-sm pb-0.5 border-b-2 transition-colors",
                sort === option.value
                  ? "font-bold text-primary-700 border-primary"
                  : "font-semibold text-dark-400 border-transparent hover:text-dark-800"
              )}
              onClick={() => onSortChange(option.value)}
            >
              {option.inlineLabel}
            </button>
          ))}
        </div>

        {/* Mobile: thu về dropdown gọn (chốt mockup S4) — h-11 đồng cao với nút Bộ lọc */}
        <Dropdown
          size="sm"
          className="md:hidden shrink-0 w-36 h-11"
          value={sort}
          options={SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => onSortChange(value as SortKey)}
        />
      </div>

      {/* Chips hàng riêng, chỉ hiện khi có lọc — chips được nguyên bề ngang màn,
          cuộn ngang thay vì wrap (mobile bleed sát mép), không tốn dọc khi chưa lọc */}
      {chips.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide -mx-[var(--container-px)] px-[var(--container-px)] md:mx-0 md:px-0">
          {chips.map((chip) => (
            // Cả chip là nút gỡ lọc — ✕ chỉ còn là hình trang trí
            <button
              key={chip.key}
              type="button"
              aria-label={`Bỏ lọc ${chip.label}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-800 hover:border-primary-300 transition-colors"
              onClick={chip.onRemove}
            >
              {chip.label}
              <XMark aria-hidden className="w-3 h-3 text-primary-500" />
            </button>
          ))}

          <button
            type="button"
            className="shrink-0 whitespace-nowrap text-sm text-dark-400 underline hover:text-dark-600 transition-colors py-2"
            onClick={onClearAll}
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
