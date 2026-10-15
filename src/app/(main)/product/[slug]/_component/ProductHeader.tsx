import { Star } from "@/components/icons";

interface ProductHeaderProps {
  title: string;
  /** Điểm trung bình từ review APPROVED — undefined khi chưa có review, ẩn cụm rating */
  rating?: number;
  reviewCount: number;
  soldCount?: number;
  isInStock: boolean;
}

// Meta 1 dòng chữ ngăn cách " · " (chốt C2 vòng refine) — pill trạng thái chỉ còn
// cho HẾT HÀNG (còn hàng là mặc định, không cần chiếm chỗ)
const ProductHeader = ({
  title,
  rating,
  reviewCount,
  soldCount,
  isInStock,
}: ProductHeaderProps) => {
  const hasRating = rating != null && reviewCount > 0;

  return (
    <>
      <h1 className="type-display-page font-display max-md:leading-snug">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 mt-2 text-sm text-dark-500">
        {hasRating && (
          <a
            href="#danh-gia"
            className="flex items-center gap-1.5 hover:text-primary-700 transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-semibold text-dark-600">{rating}</span>
            <span>· {reviewCount} đánh giá</span>
          </a>
        )}

        {soldCount != null && (
          <span>
            {hasRating && "· "}Đã bán {soldCount}
          </span>
        )}

        {!isInStock && (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full border text-dark-500 bg-white-100 border-white-600">
            Hết hàng
          </span>
        )}
      </div>
    </>
  );
};

export default ProductHeader;
