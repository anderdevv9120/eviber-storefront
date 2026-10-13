"use client";

import {
  FormEvent,
  KeyboardEvent,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import { Search, XMark } from "@/components/icons";
import useDebounce from "@/hooks/useDebounce";
import useClickOutside from "@/hooks/useClickOutside";
import { PATH } from "@/constants/paths";
import {
  buildSearchHref,
  normalizeSearchTerm,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MAX_LENGTH,
  SEARCH_MIN_CHARS,
  SEARCH_PARAM,
} from "@/constants/search";
import { cn } from "@/config/utils";
import SearchSuggestions, {
  ISuggestionState,
  suggestionOptionId,
} from "./SearchSuggestions";

interface SearchBoxProps {
  variant?: "desktop" | "mobile";
  autoFocus?: boolean;
  onSubmitted?: () => void;
  onEscape?: () => void;
  /** Panel gợi ý mở/đóng — Header dùng để không trốn theo cuộn khi user đang gõ */
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// -inset-3: icon 16px + 12px mỗi bên = vùng chạm 40px (ngưỡng rule ui-style-guide)
const ICON_BUTTON_CLASS =
  "relative flex items-center text-dark-400 transition-colors hover:text-primary-700 after:absolute after:-inset-3 after:content-['']";

const IDLE_SUGGESTIONS: ISuggestionState = {
  status: "idle",
  items: [],
  total: 0,
};

// Tách riêng + bọc Suspense: useSearchParams ép CSR bail-out chỉ trong boundary này,
// trang ISR (home/product) chứa Header không bị kéo theo
function UrlTermSync({ onChange }: { onChange: (term: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTerm =
    pathname === PATH.COLLECTION
      ? normalizeSearchTerm(searchParams.get(SEARCH_PARAM) ?? "")
      : "";

  useEffect(() => {
    onChange(urlTerm);
  }, [urlTerm, onChange]);

  return null;
}

export default function SearchBox({
  variant = "desktop",
  autoFocus,
  onSubmitted,
  onEscape,
  onOpenChange,
  className,
}: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = variant === "mobile";
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] =
    useState<ISuggestionState>(IDLE_SUGGESTIONS);

  const queryTerm = normalizeSearchTerm(useDebounce(term, SEARCH_DEBOUNCE_MS));
  const showPanel = isOpen && queryTerm.length >= SEARCH_MIN_CHARS;

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);
  useClickOutside(rootRef, close);

  // Term đổi → bỏ highlight; reset ngay lúc render thay vì effect (tránh render dây chuyền)
  const [prevQueryTerm, setPrevQueryTerm] = useState(queryTerm);
  if (queryTerm !== prevQueryTerm) {
    setPrevQueryTerm(queryTerm);
    setActiveIndex(-1);
  }

  useEffect(() => {
    onOpenChange?.(showPanel);
  }, [showPanel, onOpenChange]);

  const navigate = (href: string) => {
    // Đang ở collection: shallow pushState — CollectionContent nghe useSearchParams,
    // không SSR lại trang chỉ để đổi từ khóa
    if (pathname === PATH.COLLECTION) window.history.pushState(null, "", href);
    else router.push(href);
  };

  const submitSearch = () => {
    const normalized = normalizeSearchTerm(term);
    if (!normalized) return;
    navigate(buildSearchHref(normalized));
    close();
    inputRef.current?.blur();
    onSubmitted?.();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitSearch();
  };

  // Điều hướng sang PDP không đổi urlTerm (đang ở trang ngoài /collection) nên
  // UrlTermSync không chạy lại — phải tự dọn, nếu không panel + thanh mobile đè trang đích
  const handleSuggestionNavigate = useCallback(() => {
    setTerm("");
    close();
    onSubmitted?.();
  }, [close, onSubmitted]);

  const handleClear = () => {
    setTerm("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      // isOpen bật ngay khi focus dù panel chưa hiện — Escape đầu tiên không được nuốt im lặng
      if (showPanel) close();
      else onEscape?.();
      return;
    }
    const count = showPanel ? suggestions.items.length : 0;
    if (count === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? count - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      router.push(`${PATH.PRODUCT}/${suggestions.items[activeIndex].slug}`);
      handleSuggestionNavigate();
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Suspense fallback={null}>
        <UrlTermSync onChange={setTerm} />
      </Suspense>

      <form
        role="search"
        onSubmit={handleSubmit}
        // Mobile: khung pill nền chìm thay gạch chân — viền trong suốt giữ chỗ để
        // lúc focus đổi sang Pine không xê dịch 1px
        className={cn(
          isMobile &&
            // [&>div]: wrapper của Input không nhận className — không cho nó giãn thì
            // input co theo nội dung và ✕/kính lúp rơi vào giữa pill
            "flex h-11 items-center rounded-full border border-transparent bg-white-100 px-4 transition-colors focus-within:border-primary-500 [&>div]:min-w-0 [&>div]:flex-1"
        )}
      >
        <Input
          ref={inputRef}
          variant={isMobile ? "plain" : "standard"}
          type="text"
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          maxLength={SEARCH_MAX_LENGTH}
          placeholder="Tìm kiếm sản phẩm"
          aria-label="Tìm kiếm sản phẩm"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && activeIndex >= 0
              ? suggestionOptionId(listboxId, activeIndex)
              : undefined
          }
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn("bg-transparent pr-8 text-base", isMobile && "py-0")}
          // Một icon tại một thời điểm: rỗng là kính lúp, có chữ thì chính chỗ đó
          // thành ✕ — hai icon đứng cạnh nhau đọc như một cụm nhòe
          icon={
            term ? (
              <button
                type="button"
                aria-label="Xóa từ khóa"
                onClick={handleClear}
                className={ICON_BUTTON_CLASS}
              >
                <XMark className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className={ICON_BUTTON_CLASS}
              >
                <Search className={cn(isMobile && "h-4 w-4")} />
              </button>
            )
          }
        />
      </form>

      {showPanel && (
        <SearchSuggestions
          term={queryTerm}
          listboxId={listboxId}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onStateChange={setSuggestions}
          onViewAll={submitSearch}
          onSelect={handleSuggestionNavigate}
          className={cn(
            "absolute z-50 mt-2.5",
            isMobile ? "inset-x-0" : "right-0 w-[400px]"
          )}
        />
      )}
    </div>
  );
}
