"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ButtonChevron from "./ButtonChevron";
import RatingStar from "./RatingStar";
import { CheckOutline } from "@/components/icons";
import { useIsTablet, useIsMobile } from "@/hooks/useMediaQuery";
import { IFeaturedReview } from "@/@types/Home.type";
import { cn } from "@/config/utils";

interface CustomerReviewProps {
  reviews: IFeaturedReview[];
}

const CustomerReview = ({ reviews }: CustomerReviewProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const customerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const getVisibleItems = () => {
    if (isMobile) return 1.5;
    if (isTablet) return 2.5;
    return 4;
  };

  useEffect(() => {
    const handleResize = () => {
      if (customerRef.current) {
        setContainerWidth(customerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleItems = getVisibleItems();
  const totalGap = (visibleItems - 1) * 16;
  const itemWidth = (containerWidth - totalGap) / visibleItems - 2;
  const calculateWidth = `${itemWidth * reviews.length + 16 * (reviews.length - 1) - (isTablet ? 16 : 0)}px`;
  const transform = isTablet
    ? "none"
    : `translateX(-${currentIndex * (itemWidth + 16)}px)`;
  // visibleItems có thể là số thập phân (1.5/2.5) → làm tròn để index luôn nguyên
  const calculateIndex = Math.max(0, Math.ceil(reviews.length - visibleItems));

  // Clamp khi đổi breakpoint/resize — index cũ vượt max là track translate quá đà
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, calculateIndex));
  }, [calculateIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? calculateIndex : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= calculateIndex ? 0 : prevIndex + 1
    );
  };

  if (reviews.length === 0) return null;

  return (
    <div
      className="relative lg:overflow-hidden lg:w-auto pt-2 -mt-2 pb-4 -mb-3 pl-1 -ml-1 pr-1 -mr-1 scrollbarStyle group/rail"
      ref={customerRef}
    >
      <div
        className="flex transition-transform duration-500"
        style={{
          minWidth: calculateWidth,
          transform: transform,
        }}
      >
        {reviews.map((review, index) => (
          <div
            key={review._id}
            className={cn(
              "bg-white snap-center rounded-xl border border-white-300 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden",
              index !== reviews.length - 1 && "mr-4"
            )}
            style={{
              flex: `0 0 ${itemWidth}px`,
            }}
          >
            {/* Cover GĐ1 = ảnh SẢN PHẨM (data sẵn có, không giả ảnh khách);
                có tính năng khách upload ảnh review thì thay nguồn tại đây */}
            {review.productImage && (
              <Image
                src={review.productImage}
                alt={review.productName ?? review.displayName}
                width={400}
                height={300}
                className="w-full aspect-[4/3] object-cover"
              />
            )}

            <div className="p-4 pb-[18px] flex flex-col flex-1">
              <div className="flex gap-3 items-center mb-2">
                <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-bold">
                  {review.displayName.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-sm">{review.displayName}</p>
                  <RatingStar rating={review.rating} classStar="w-3.5 h-3.5" />
                </div>
              </div>

              {/* content optional 2 phía contract — không guard là card hiện «""» */}
              {review.content && (
                <p className="text-sm text-dark-600 leading-relaxed line-clamp-3 flex-1">
                  &ldquo;{review.content}&rdquo;
                </p>
              )}

              {review.productName && (
                <span className="inline-flex items-center gap-1.5 w-max mt-3 px-3 py-1 rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                  <CheckOutline className="w-3 h-3" />
                  Đã mua: {review.productName}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <ButtonChevron
        className="left-3 hidden shadow-xl lg:block hover:bg-white-50"
        onClick={handlePrev}
      />
      <ButtonChevron
        className="right-3 hidden shadow-xl lg:block hover:bg-white-50"
        onClick={handleNext}
        isRightButton
      />
    </div>
  );
};

export default CustomerReview;
