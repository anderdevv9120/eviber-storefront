import { memo } from "react";
import { Star } from "@/components/icons";
import { cn } from "@/config/utils";

type RatingStarProps = {
  rating?: number;
  classStar?: string;
  /** Số điểm đã hiển thị bằng chữ ngay cạnh → ẩn khỏi screen reader để không đọc lặp */
  decorative?: boolean;
};

const RatingStar = ({ rating, classStar, decorative }: RatingStarProps) => {
  const widthPercentage = rating ? `${(rating / 5) * 100}%` : "0";

  // Thuần hiển thị — không hiệu ứng hover (control giả trên element đọc, /ui-audit)
  return (
    <div
      className="relative w-fit"
      {...(decorative
        ? { "aria-hidden": true }
        : {
            role: "img",
            "aria-label": `${(rating ?? 0).toLocaleString("vi-VN")} trên 5 sao`,
          })}
    >
      <span
        className="flex gap-1 absolute flex-shrink-0 top-0 left-0 z-10 whitespace-nowrap overflow-hidden"
        style={{ width: widthPercentage }}
      >
        <StarList colorClass="text-yellow-500" className={classStar} />
      </span>

      <span className="flex gap-1">
        <StarList
          colorClass="text-[rgb(var(--color-star-empty))]"
          className={classStar}
        />
      </span>
    </div>
  );
};

export default memo(RatingStar);

type StarListProps = {
  colorClass: string;
  className?: string;
};

const StarList = ({ colorClass, className }: StarListProps) => {
  const LIST = [1, 2, 3, 4, 5];

  return (
    <>
      {LIST.map((i) => (
        <Star
          key={i}
          className={cn("flex-shrink-0 cursor-default", colorClass, className)}
        />
      ))}
    </>
  );
};
