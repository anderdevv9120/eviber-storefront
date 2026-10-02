"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";

interface EmptyCollectionProps {
  onClearFilters: () => void;
  /** Có từ khóa → copy nêu đích danh từ khóa, không đổ lỗi cho bộ lọc */
  searchTerm?: string;
}

export default function EmptyCollection({
  onClearFilters,
  searchTerm,
}: EmptyCollectionProps) {
  return (
    <div className="flex flex-col items-center text-center py-14">
      {/* Minh họa inline tông Pine — ảnh empty-box.png cũ lệch palette (xanh dương) */}
      <div className="flex items-center justify-center w-28 h-28 rounded-full bg-primary-50 mb-6">
        <svg
          className="w-12 h-12 text-primary-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
          <path d="M8.5 11h5" />
        </svg>
      </div>

      <p className="text-lg font-semibold mb-1.5">
        {searchTerm
          ? `Không tìm thấy sản phẩm nào cho “${searchTerm}”`
          : "Không có sản phẩm khớp bộ lọc"}
      </p>
      <p className="text-sm text-dark-400 mb-6 max-w-xs">
        {searchTerm
          ? "Thử từ khóa ngắn hơn, hoặc xóa bộ lọc để xem tất cả sản phẩm."
          : "Thử nới điều kiện lọc hoặc xóa bộ lọc để xem tất cả sản phẩm."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button className="px-6" onClick={onClearFilters}>
          Xóa bộ lọc
        </Button>

        <Link href={PATH.HOME}>
          <Button variant="outline" className="px-6">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
