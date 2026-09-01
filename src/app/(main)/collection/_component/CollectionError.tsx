"use client";

import Button from "@/components/ui/Button";

interface CollectionErrorProps {
  onRetry: () => void;
}

// Nhánh lỗi tải danh sách — tách khỏi EmptyCollection vì "không tải được"
// khác bản chất "không có sản phẩm khớp bộ lọc"
export default function CollectionError({ onRetry }: CollectionErrorProps) {
  return (
    <div className="flex flex-col items-center text-center py-14">
      <div className="flex items-center justify-center w-28 h-28 rounded-full bg-white-100 mb-6">
        <svg
          className="w-12 h-12 text-dark-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
      </div>

      <p className="text-lg font-semibold mb-1.5">
        Không tải được danh sách sản phẩm
      </p>
      <p className="text-sm text-dark-400 mb-6 max-w-xs">
        Có lỗi khi kết nối máy chủ. Vui lòng thử lại trong giây lát.
      </p>

      <Button className="px-6" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}
