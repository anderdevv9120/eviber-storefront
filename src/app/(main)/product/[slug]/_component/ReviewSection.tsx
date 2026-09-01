"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/config/utils";
import RatingStar from "@/components/ui/RatingStar";
import Pagination from "@/components/ui/Pagination";
import useIgnoreFirstEffect from "@/hooks/useIgnoreFirstEffect";
import { getProductReviews } from "@/apis/review";
import { REVIEW_PAGE_SIZE } from "@/constants";
import {
  IProductReviewItem,
  IProductReviewsResponse,
} from "@/@types/Review.type";
import { formatDate } from "@/utils/formatTime";

const RATING_LEVELS = [5, 4, 3, 2, 1];

interface ReviewSectionProps {
  productId: string;
  /** Trang 1 không lọc — fetch server-side ở page.tsx (SEO + không nháy loading lần đầu) */
  initialData: IProductReviewsResponse;
}

// "Minh Long" → "ML" — avatar chữ cái từ 2 từ cuối của tên hiển thị
const getInitials = (displayName: string) => {
  const words = displayName.trim().split(/\s+/);
  return words
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const ReviewSection = ({ productId, initialData }: ReviewSectionProps) => {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // summary lấy theo response mới nhất — BE luôn tính trên toàn bộ review approved
  // nên histogram/chips không đổi số khi đang lọc (contract GET /reviews)
  const summary = data.summary;

  useIgnoreFirstEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    getProductReviews(
      {
        productId,
        page,
        pageSize: REVIEW_PAGE_SIZE,
        rating: ratingFilter ?? undefined,
      },
      controller.signal
    )
      .then((res) => {
        if (res?.data) setData(res.data);
      })
      // Lỗi mạng: interceptor đã toast global — giữ data trang trước
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    // Cleanup hủy request đang bay khi đổi trang/lọc tiếp hoặc rời trang
    return () => controller.abort();
  }, [productId, page, ratingFilter]);

  const handleFilter = (rating: number | null) => {
    setRatingFilter(rating);
    setPage(1);
  };

  return (
    // scroll-mt bù header fixed khi nhảy anchor từ meta "N đánh giá"
    <section id="danh-gia" className="scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-bold mb-5">Đánh giá sản phẩm</h2>

      {summary.total === 0 ? (
        // E1 (chốt /ui-audit vòng 2): giữ vỏ panel + sao rỗng + copy mời —
        // 2 trạng thái của section cùng một design
        <div className="bg-white-50 border border-white-300 rounded-lg px-6 py-11 text-center">
          <div className="flex justify-center">
            <RatingStar rating={0} classStar="w-6 h-6" />
          </div>
          <p className="mt-3 font-bold">Chưa có đánh giá nào</p>
          <p className="mt-1 text-sm text-dark-500">
            Hãy là người đầu tiên đánh giá sản phẩm này sau khi mua hàng.
          </p>
        </div>
      ) : (
        // V2 (chốt section-rhythm): MỘT panel nền white-50 ôm trọn tổng quan + list
        // + pagination — khối review "đóng gói" thành một vùng, mô tả phía trên trần
        <div className="bg-white-50 border border-white-300 rounded-lg p-5 md:p-6">
          {/* Panel 3 khối S1++: điểm | histogram (bar Pine) | chips lọc */}
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[190px_1fr_1fr] items-center pb-5 md:pb-6 border-b border-white-300">
            <div className="text-center lg:border-r lg:border-white-300 lg:pr-6">
              <p className="text-4xl font-extrabold leading-none">
                {summary.ratingAvg}
              </p>
              <div className="flex justify-center mt-2.5">
                <RatingStar rating={summary.ratingAvg} classStar="w-4 h-4" />
              </div>
              <p className="mt-1.5 text-sm text-dark-500">
                {summary.total} đánh giá
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              {RATING_LEVELS.map((level) => {
                const count = summary.ratingCounts[level] ?? 0;
                const percentage =
                  summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div
                    key={level}
                    className="flex items-center gap-2 text-sm text-dark-500"
                  >
                    <span className="w-6 shrink-0">{level}★</span>
                    <div className="flex-1 h-2 rounded-full bg-white-300 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {/* w-8: đủ chỗ count 3 chữ số khi cắm data thật GĐ2 */}
                    <span className="w-8 shrink-0 text-right text-dark-500 tabular-nums">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-sm font-bold mb-2.5">Lọc theo mức sao</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label={`Tất cả (${summary.total})`}
                  isActive={ratingFilter == null}
                  onClick={() => handleFilter(null)}
                />
                {RATING_LEVELS.map((level) => {
                  const count = summary.ratingCounts[level] ?? 0;
                  // Mức 0 review ẨN hẳn (chốt /ui-audit vòng 2) — chip disabled chỉ
                  // gây noise + đẩy hàng chip xuống dòng 2
                  if (count === 0) return null;
                  return (
                    <FilterChip
                      key={level}
                      label={`${level}★ (${count})`}
                      isActive={ratingFilter === level}
                      onClick={() => handleFilter(level)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {data.items.length === 0 ? (
            <div className="py-10 text-center text-dark-400">
              <p>Chưa có đánh giá {ratingFilter}★.</p>
              <button
                type="button"
                className="mt-2 font-semibold text-primary-700 hover:text-primary-800"
                onClick={() => handleFilter(null)}
              >
                Bỏ lọc
              </button>
            </div>
          ) : (
            // Đang fetch trang/lọc mới: mờ list cũ thay vì unmount (giữ chiều cao,
            // không giật layout); interceptor toast khi lỗi nên không cần error UI riêng
            <div
              className={cn(
                "transition-opacity",
                isLoading && "opacity-50 pointer-events-none"
              )}
              aria-busy={isLoading}
            >
              {data.items.map((item) => (
                <ReviewItem key={item._id} item={item} />
              ))}
              <Pagination
                total={data.total}
                pageSize={REVIEW_PAGE_SIZE}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

interface FilterChipProps {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const FilterChip = ({
  label,
  isActive,
  disabled,
  onClick,
}: FilterChipProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      // relative + after: hit-area ~40px cho mobile, visual giữ pill gọn
      "relative px-3.5 py-2 text-sm rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 after:absolute after:-inset-1 after:content-['']",
      isActive
        ? "border-primary-600 bg-primary-600 text-white font-semibold"
        : "border-white-600 text-dark-500 hover:border-primary-300",
      disabled &&
        "opacity-50 cursor-not-allowed bg-white-100 hover:border-white-600"
    )}
  >
    {label}
  </button>
);

const ReviewItem = ({ item }: { item: IProductReviewItem }) => (
  <div className="py-4 border-b border-white-300 last:border-b-0 border-dashed">
    <div className="flex items-center gap-2">
      {/* Guest review chỉ có displayName (contract BE) → avatar chữ cái */}
      <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-white-300 text-xs font-bold text-dark-500">
        {getInitials(item.displayName)}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate">{item.displayName}</p>
        <p className="text-xs text-dark-500">{formatDate(item.created_at)}</p>
      </div>
      <div className="ml-auto shrink-0">
        <RatingStar rating={item.rating} classStar="w-3.5 h-3.5" />
      </div>
    </div>
    {item.title && <p className="mt-2 text-sm font-semibold">{item.title}</p>}
    {item.content && (
      <p className="mt-1.5 text-dark-500 leading-relaxed">{item.content}</p>
    )}
    {item.images.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2.5">
        {item.images.map((imageUrl) => (
          <Image
            key={imageUrl}
            src={imageUrl}
            alt={`Ảnh đánh giá của ${item.displayName}`}
            width={128}
            height={128}
            className="w-16 h-16 rounded-lg object-cover bg-white-100"
          />
        ))}
      </div>
    )}
  </div>
);

export default ReviewSection;
