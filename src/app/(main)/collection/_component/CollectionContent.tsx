"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/config/utils";
import CardItem from "@/components/ui/CardItem";
import Pagination from "@/components/ui/Pagination";
import { getProducts } from "@/apis/product";
import { ICategoryItem } from "@/@types/Home.type";
import { PATH } from "@/constants/paths";
import CollectionSidebar from "./CollectionSidebar";
import CollectionSkeleton from "./CollectionSkeleton";
import CollectionError from "./CollectionError";
import CollectionToolbar, { IFilterChip } from "./CollectionToolbar";
import EmptyCollection from "./EmptyCollection";
import {
  COLLECTION_GRID_CLASS,
  ICollectionCategoryOption,
  PAGE_SIZE,
  PRICE_CAP,
  SortKey,
} from "./collection.const";
import {
  buildCollectionSearch,
  EMPTY_COLLECTION_RESULT,
  ICollectionQuery,
  ICollectionResult,
  parseCollectionQuery,
  toProductApiParams,
} from "./collection.query";

interface CollectionContentProps {
  categories: ICategoryItem[];
  /** Query đã parse ở server — trùng URL lúc SSR, dùng để skip fetch lặp lần mount đầu */
  initialQuery: ICollectionQuery;
  /** null = SSR fetch lỗi → client tự fetch lại khi mount (đường retry) */
  initialResult: ICollectionResult | null;
}

// Nhãn chip khoảng giá dạng gọn: 150k, 1tr
const formatPriceShort = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toString().replace(".", ",")}tr`
    : `${Math.round(value / 1000)}k`;

const formatPriceRangeLabel = (min: number, max: number) => {
  if (min <= 0) return `Dưới ${formatPriceShort(max)}`;
  if (max >= PRICE_CAP) return `Trên ${formatPriceShort(min)}`;
  return `${formatPriceShort(min)} – ${formatPriceShort(max)}`;
};

export default function CollectionContent({
  categories,
  initialQuery,
  initialResult,
}: CollectionContentProps) {
  const searchParams = useSearchParams();
  // URL là nguồn sự thật duy nhất — handler chỉ đổi URL, effect dưới fetch theo;
  // back/forward vì vậy tự đi đúng trạng thái filter mà không cần code riêng
  const query = useMemo(
    () => parseCollectionQuery(searchParams),
    [searchParams]
  );
  const queryKey = buildCollectionSearch(query);

  const [result, setResult] = useState(
    initialResult ?? EMPTY_COLLECTION_RESULT
  );
  const [isLoading, setIsLoading] = useState(initialResult === null);
  // Lỗi fetch giữa phiên ≠ 0 kết quả thật — không được mượn EmptyCollection
  // ("Không có sản phẩm khớp bộ lọc" là khẳng định sai khi BE chết)
  const [hasError, setHasError] = useState(false);
  // Bump để chạy lại fetch CÙNG key sau lỗi (nút Thử lại) — URL không đổi thì effect không tự chạy
  const [retryTick, setRetryTick] = useState(0);
  const gridTopRef = useRef<HTMLDivElement>(null);
  // Khóa của lần fetch gần nhất (khởi tạo = key SSR) — effect chỉ fetch khi key ĐỔI,
  // nên lần mount đầu không fetch lại (so giá trị, không đếm lần chạy: StrictMode-safe).
  // SSR lỗi (initialResult null) → khởi tạo null để lần mount đầu FETCH lại (retry)
  const lastFetchedKeyRef = useRef<string | null>(
    initialResult ? buildCollectionSearch(initialQuery) : null
  );

  const categoryOptions: ICollectionCategoryOption[] = useMemo(
    () =>
      categories.flatMap((category) =>
        category.slug ? [{ slug: category.slug, name: category.name }] : []
      ),
    [categories]
  );

  const navigate = (
    next: ICollectionQuery,
    { replace = false }: { replace?: boolean } = {}
  ) => {
    const search = buildCollectionSearch(next);
    if (search === queryKey) return;
    // Shallow routing (Next 14 sync history API ↔ useSearchParams) —
    // không re-render server component, mỗi thao tác = đúng 1 request API
    const url = `${PATH.COLLECTION}${search}`;
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  };

  useEffect(() => {
    if (lastFetchedKeyRef.current === queryKey) return;

    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);

    getProducts(toProductApiParams(query), controller.signal)
      .then((response) => {
        // Ghi key khi HOÀN TẤT, không phải lúc bắt đầu — fetch bị abort giữa chừng
        // (StrictMode mount đôi, hoặc đổi filter nhanh) thì lượt effect sau còn fetch lại được
        lastFetchedKeyRef.current = queryKey;
        const list = response?.data;
        const next: ICollectionResult = {
          items: list?.data ?? [],
          total: list?.total ?? 0,
          totalPage: list?.totalPage ?? 1,
        };
        // Page vượt dải (link cũ, data đã bớt) → replace về trang cuối, effect refetch;
        // giữ isLoading để không chớp empty state giữa 2 nhịp. Guard totalPage !== page:
        // BE trả totalPage trùng trang hiện tại (count/find lệch snapshot) thì navigate
        // no-op — phải rơi xuống setResult, không thì isLoading kẹt true
        if (
          next.items.length === 0 &&
          next.total > 0 &&
          query.page > 1 &&
          next.totalPage !== query.page
        ) {
          navigate({ ...query, page: next.totalPage }, { replace: true });
          return;
        }
        setResult(next);
        setIsLoading(false);
      })
      .catch(() => {
        // Request bị hủy bởi thao tác mới hơn — không phải lỗi, không đụng state
        if (controller.signal.aborted) return;
        lastFetchedKeyRef.current = queryKey;
        setResult(EMPTY_COLLECTION_RESULT);
        setHasError(true);
        setIsLoading(false);
      });

    // Đổi filter liên tục: cleanup hủy request cũ → kết quả cũ không đè kết quả mới
    return () => controller.abort();
    // queryKey là dạng chuẩn hóa của query — đủ làm dep (retryTick chỉ để re-run sau lỗi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, retryTick]);

  const handleRetry = () => {
    lastFetchedKeyRef.current = null;
    setRetryTick((tick) => tick + 1);
  };

  // Deep-link page vượt dải: SSR đã trả trang rỗng (total > 0) và effect trên skip
  // lần mount đầu → clamp riêng cho payload SSR (replace, không rác history)
  useEffect(() => {
    if (
      initialResult &&
      initialResult.items.length === 0 &&
      initialResult.total > 0 &&
      initialQuery.page > 1
    ) {
      navigate(
        { ...initialQuery, page: initialResult.totalPage },
        { replace: true }
      );
    }
    // chỉ áp cho dữ liệu SSR lúc mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPriceNarrowed = query.priceMin > 0 || query.priceMax < PRICE_CAP;

  const handleToggleCategory = (slug: string) => {
    const nextCategories = query.categories.includes(slug)
      ? query.categories.filter((item) => item !== slug)
      : [...query.categories, slug];
    navigate({ ...query, categories: nextCategories, page: 1 });
  };

  const handlePriceChange = (min: number, max: number) => {
    // FilterPrice debounce bắn cả lúc mount/remount — giá trị không đổi thì bỏ qua
    if (min === query.priceMin && max === query.priceMax) return;
    navigate({ ...query, priceMin: min, priceMax: max, page: 1 });
  };

  const handleResetPrice = () => {
    navigate({ ...query, priceMin: 0, priceMax: PRICE_CAP, page: 1 });
  };

  const handleClearSearch = () => {
    navigate({ ...query, search: "", page: 1 });
  };

  const handleClearAll = () => {
    navigate({
      ...query,
      search: "",
      categories: [],
      priceMin: 0,
      priceMax: PRICE_CAP,
      page: 1,
    });
  };

  const handleSortChange = (value: SortKey) => {
    navigate({ ...query, sort: value, page: 1 });
  };

  const handlePageChange = (nextPage: number) => {
    navigate({ ...query, page: nextPage });
    // Scroll tức thời về đầu grid — smooth-scroll toàn trang chạy song song
    // với loading khiến user nhìn thấy trang trượt qua vùng đang mờ
    gridTopRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const chips: IFilterChip[] = [
    ...(query.search
      ? [
          {
            key: "search",
            label: `Từ khóa: ${query.search}`,
            onRemove: handleClearSearch,
          },
        ]
      : []),
    ...query.categories.map((slug) => ({
      key: `category-${slug}`,
      // Slug lạ trên URL (danh mục đã xóa) vẫn hiện chip để gỡ được
      label:
        categoryOptions.find((category) => category.slug === slug)?.name ??
        slug,
      onRemove: () => handleToggleCategory(slug),
    })),
    ...(isPriceNarrowed
      ? [
          {
            key: "price",
            label: formatPriceRangeLabel(query.priceMin, query.priceMax),
            onRemove: handleResetPrice,
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-start gap-8 xl:gap-12">
      <CollectionSidebar
        categories={categoryOptions}
        selectedCategories={query.categories}
        onToggleCategory={handleToggleCategory}
        onPriceChange={handlePriceChange}
        priceMin={query.priceMin}
        priceMax={query.priceMax}
        total={result.total}
        onClearAll={handleClearAll}
      />

      <div
        ref={gridTopRef}
        className="flex-1 min-w-0 scroll-mt-[var(--header-offset)]"
      >
        <CollectionToolbar
          total={result.total}
          chips={chips}
          onClearAll={handleClearAll}
          sort={query.sort}
          onSortChange={handleSortChange}
        />

        {hasError ? (
          <CollectionError onRetry={handleRetry} />
        ) : result.total === 0 && isLoading ? (
          // Chưa có gì để giữ lại mà đang fetch (retry sau SSR lỗi) → skeleton thay vì trang trống
          <CollectionSkeleton />
        ) : result.total === 0 ? (
          <EmptyCollection
            onClearFilters={handleClearAll}
            searchTerm={query.search}
          />
        ) : (
          <div
            aria-busy={isLoading}
            className={cn(
              "transition-opacity duration-200",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <div className={COLLECTION_GRID_CLASS}>
              {result.items.map((product) => (
                <CardItem key={product._id} productItem={product} />
              ))}
            </div>

            <Pagination
              total={result.total}
              currentPage={query.page}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
              className="my-8"
            />
          </div>
        )}
      </div>
    </div>
  );
}
