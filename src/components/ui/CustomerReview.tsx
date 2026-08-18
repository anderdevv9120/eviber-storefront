"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ButtonChevron from "./ButtonChevron";
import RatingStar from "./RatingStar";
import { useIsTablet, useIsMobile } from "@/hooks/useMediaQuery";
import { customerReviews } from "@/mocks/fetchData";
import { cn } from "@/config/utils";

const CustomerReview = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const customerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const getVisibleItems = () => {
    if (isMobile) return 1.5;
    if (isTablet) return 2.5;
    return 3;
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
  const calculateWidth = `${itemWidth * customerReviews.length + 16 * (customerReviews.length - 1) - (isTablet ? 16 : 0)}px`;
  const transform = isTablet
    ? "none"
    : `translateX(-${currentIndex * (itemWidth + 16)}px)`;
  // visibleItems có thể là số thập phân (1.5/2.5) → làm tròn để index luôn nguyên
  const calculateIndex = Math.max(
    0,
    Math.ceil(customerReviews.length - visibleItems)
  );

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

  return (
    <>
      <div
        className="relative lg:overflow-hidden lg:w-auto pb-1 pl-1 scrollbarStyle"
        ref={customerRef}
      >
        <div
          className="flex transition-transform duration-500"
          style={{
            minWidth: calculateWidth,
            transform: transform,
          }}
        >
          {customerReviews.map((customer, index) => (
            <div
              key={customer.id}
              className={cn(
                "bg-white snap-center rounded-lg shadow-md flex flex-col items-center justify-center",
                index !== customerReviews.length - 1 && "mr-4"
              )}
              style={{
                flex: `0 0 ${itemWidth}px`,
              }}
            >
              {customer.reviewImg && (
                <Image
                  src={customer.reviewImg}
                  alt="Review Image"
                  className="object-cover rounded-t-lg w-full h-60"
                  width={200}
                  height={200}
                />
              )}

              <div className="flex items-start p-6 flex-col w-full">
                <p className="text-gray-700 mb-4 w-full lg:h-36 content-center lg:line-clamp-6 line-clamp-3 xs:h-20">
                  {customer.feedback}
                </p>

                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-4 items-center">
                    {customer.userAvatar && (
                      <Image
                        src={customer.userAvatar}
                        className="rounded-full object-cover"
                        alt="User avatar"
                        width={50}
                        height={50}
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold">{customer.name}</span>
                      <span className="text-gray-400">{customer.role}</span>
                    </div>
                  </div>

                  <RatingStar
                    rating={customer.stars}
                    classStar="sm:w-4 sm:h-4 w-2 h-2"
                  />
                </div>
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
    </>
  );
};

export default CustomerReview;
