"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ItemPrice from "@/components/ui/ItemPrice";
import { suggestProducts } from "@/apis/product";
import { IProductListItem } from "@/@types/Product.type";
import { PATH } from "@/constants/paths";
import { SEARCH_SUGGEST_LIMIT } from "@/constants/search";
import { cn } from "@/config/utils";

export interface ISuggestionState {
  status: "idle" | "loading" | "ready" | "error";
  items: IProductListItem[];
  total: number;
}

interface SearchSuggestionsProps {
  /** Từ khóa ĐÃ debounce — component fetch theo giá trị này */
  term: string;
  listboxId: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onStateChange: (state: ISuggestionState) => void;
  onViewAll: () => void;
  onSelect: () => void;
  className?: string;
}

export const suggestionOptionId = (listboxId: string, index: number) =>
  `${listboxId}-option-${index}`;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Tô phần khớp; BE khớp cả mô tả nên có hàng không chứa từ khóa trong tên → giữ nguyên
function Highlight({ text, term }: { text: string; term: string }) {
  const parts = text.split(new RegExp(`(${escapeRegex(term)})`, "i"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={index} className="bg-transparent text-primary-700">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchSuggestions({
  term,
  listboxId,
  activeIndex,
  onActiveIndexChange,
  onStateChange,
  onViewAll,
  onSelect,
  className,
}: SearchSuggestionsProps) {
  const [state, setState] = useState<ISuggestionState>({
    status: "idle",
    items: [],
    total: 0,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading" }));

    suggestProducts(term, SEARCH_SUGGEST_LIMIT, controller.signal)
      .then((response) => {
        const list = response?.data;
        setState({
          status: "ready",
          items: list?.data ?? [],
          total: list?.total ?? 0,
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: "error", items: [], total: 0 });
      });

    return () => controller.abort();
  }, [term]);

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white-300 bg-white shadow-auth-card",
        className
      )}
    >
      {state.status === "loading" && state.items.length === 0 ? (
        <div aria-hidden>
          {Array.from({ length: SEARCH_SUGGEST_LIMIT }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 px-3.5 py-2.5"
            >
              <div className="h-14 w-14 shrink-0 rounded-lg bg-white-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-white-200 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-white-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : state.status === "error" ? (
        <div className="px-4 py-6 text-center text-sm text-dark-500">
          <p className="font-semibold text-dark-800">Chưa tải được gợi ý</p>
          <p className="mt-1">
            Nhấn Enter để tìm trực tiếp trên trang sản phẩm.
          </p>
        </div>
      ) : state.items.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-dark-500">
          <p className="font-semibold text-dark-800">
            Không có sản phẩm nào cho “{term}”
          </p>
          <p className="mt-1">
            Thử từ khóa ngắn hơn, hoặc{" "}
            <Link
              href={PATH.COLLECTION}
              className="font-semibold text-primary-700 underline underline-offset-2"
            >
              xem tất cả sản phẩm
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Gợi ý sản phẩm"
            className={cn(
              "transition-opacity",
              state.status === "loading" && "opacity-60"
            )}
          >
            {state.items.map((item, index) => (
              <li
                key={item._id}
                id={suggestionOptionId(listboxId, index)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <Link
                  href={`${PATH.PRODUCT}/${item.slug}`}
                  tabIndex={-1}
                  onMouseEnter={() => onActiveIndexChange(index)}
                  onClick={onSelect}
                  className={cn(
                    "flex items-center gap-3.5 px-3.5 py-2.5 transition-colors",
                    index === activeIndex && "bg-primary-50"
                  )}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-dark-800">
                      <Highlight text={item.name} term={term} />
                    </p>
                    {item.soldCount != null && (
                      <p className="text-xs text-dark-400">
                        Đã bán {item.soldCount}
                      </p>
                    )}
                    <ItemPrice
                      price={item.price}
                      originalPrice={item.originalPrice}
                      currentPriceClass="text-sm font-bold text-terracotta"
                      priceClass="text-xs"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onViewAll}
            className="flex w-full items-center justify-between gap-3 border-t border-white-300 px-3.5 py-3 text-left text-sm font-semibold text-primary-700 transition-colors hover:bg-white-50"
          >
            <span className="truncate">Xem tất cả kết quả cho “{term}” →</span>
            <span className="shrink-0 text-xs font-medium text-dark-400">
              {state.total} sản phẩm
            </span>
          </button>
        </>
      )}
    </div>
  );
}
