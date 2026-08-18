"use client";

import { useState, useRef, useEffect, memo } from "react";
import ButtonChevron from "./ButtonChevron";
import CardItem from "./CardItem";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";
import Spin from "./Spin";
import { IProductListItem } from "@/@types/Product.type";

const CardItemSlider = ({
  dataProduct,
}: {
  dataProduct: IProductListItem[];
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const getVisibleItems = () => {
    if (isMobile) return 2;
    if (isTablet) return 4;
    return 5;
  };

  const visibleItems = getVisibleItems();
  const productLength = dataProduct.length;
  const itemWidth = (containerWidth - 12 * (visibleItems - 1)) / visibleItems;
  const totalWidth = itemWidth * productLength + 12 * (productLength - 1);
  const transform = `translateX(-${currentIndex * (itemWidth + 12)}px)`;
  // Index cuối hợp lệ, không âm khi productLength < visibleItems
  const maxIndex = Math.max(0, productLength - visibleItems);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, isTablet, productLength]);

  // Clamp currentIndex khi số item hiển thị đổi (đổi breakpoint)
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  if (dataProduct.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-[307px]">
        <Spin isLoading className="w-10 h-10 text-dark-200 fill-light-blue-900">
          <div className="text-center text-sm mt-2">Không có sản phẩm...</div>
        </Spin>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden group">
      {isMobile ? (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          {dataProduct.map((item) => (
            <CardItem key={item._id} productItem={item} isVertical />
          ))}
        </div>
      ) : (
        <div
          className="flex gap-3 transition-transform duration-500"
          style={{
            width: `${totalWidth}px`,
            transform: transform,
          }}
        >
          {dataProduct.map((item) => (
            <div
              key={item._id}
              style={{
                flex: `0 0 ${itemWidth}px`,
              }}
            >
              <CardItem productItem={item} isVertical />
            </div>
          ))}
        </div>
      )}

      {!isMobile && productLength > visibleItems && (
        <>
          <ButtonChevron className="left-3" onClick={handlePrev} />
          <ButtonChevron
            isRightButton
            className="right-3"
            onClick={handleNext}
          />
        </>
      )}
    </div>
  );
};

export default memo(CardItemSlider);
