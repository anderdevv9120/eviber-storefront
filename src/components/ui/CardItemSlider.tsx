"use client";

import { useState, useRef, useEffect, memo } from "react";
import ButtonChevron from "./ButtonChevron";
import CardItem from "./CardItem";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";
import Spin from "./Spin";
import { cn } from "@/config/utils";
import { IProductListItem } from "@/@types/Product.type";

// Gap giữa các card (px) — dùng CHUNG cho CSS track lẫn phép tính itemWidth/transform;
// đổi gap chỉ sửa hằng này, đừng gắn class gap-* vào track (CSS lệch JS là item cuối bị cắt)
const CARD_GAP = 16;
// Chevron hiện sẵn ở mọi breakpoint (ghi đè lg:opacity-0 chờ hover của ButtonChevron) — người xem phải thấy rail còn cuộn được
const CHEVRON_VISIBLE =
  "lg:opacity-100 lg:pointer-events-auto lg:translate-x-0";

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
    if (isTablet) return 3;
    return 5;
  };

  const visibleItems = getVisibleItems();
  const productLength = dataProduct.length;
  const itemWidth =
    (containerWidth - CARD_GAP * (visibleItems - 1)) / visibleItems;
  const totalWidth = itemWidth * productLength + CARD_GAP * (productLength - 1);
  const transform = `translateX(-${currentIndex * (itemWidth + CARD_GAP)}px)`;
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
  if (currentIndex > maxIndex) {
    setCurrentIndex(maxIndex);
  }

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

  if (isMobile) {
    // Cuộn ngang full-bleed, card ~62% để card kế lộ một phần báo "còn nữa"; pb chừa shadow vì overflow-x kéo theo clip dọc
    return (
      <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scroll-px-[var(--container-px)] scrollbar-hide -mx-[var(--container-px)] px-[var(--container-px)] pt-1 -mt-1 pb-4 -mb-4">
        {dataProduct.map((item) => (
          <div key={item._id} className="basis-[62%] shrink-0 snap-start">
            <CardItem productItem={item} />
          </div>
        ))}
      </div>
    );
  }

  const hasPaging = productLength > visibleItems;

  return (
    // Wrapper ngoài CHỈ lo clip + đệm thở cho shadow (margin âm bù nhịp layout).
    // Calibrate theo shadow-card-hover: dưới ~46px → pb-12; ngang PHẢI < CARD_GAP (16px) —
    // đệm rộng hơn gap là lộ mép card kế tiếp của track → px-3.5 (14px). Shadow ngang tỏa ~28px > 14px
    // nên mask fade đúng dải đệm 14px thay cho vệt cắt cứng ở mép clip.
    <div className="overflow-hidden group/rail px-3.5 -mx-3.5 pt-3 -mt-3 pb-12 -mb-10 [mask-image:linear-gradient(to_right,transparent,black_14px,black_calc(100%-14px),transparent)]">
      {/* Lớp relative ôm SÁT content để chevron top-1/2 căn đúng giữa hàng card
          (đặt absolute theo wrapper padding lệch trên/dưới là chevron tụt tâm) */}
      <div className="relative">
        <div ref={containerRef}>{renderTrack()}</div>

        {hasPaging && (
          <>
            <ButtonChevron
              className={cn(CHEVRON_VISIBLE, "left-1")}
              onClick={handlePrev}
            />
            <ButtonChevron
              isRightButton
              className={cn(CHEVRON_VISIBLE, "right-1")}
              onClick={handleNext}
            />
          </>
        )}
      </div>

      {hasPaging && (
        <div
          aria-hidden
          className="relative h-0.5 mt-6 rounded-full bg-white-300 overflow-hidden"
        >
          <div
            className="absolute inset-y-0 rounded-full bg-deep transition-[left] duration-500"
            style={{
              width: `${(visibleItems / productLength) * 100}%`,
              left: `${(currentIndex / productLength) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );

  function renderTrack() {
    return (
      <div
        className="flex transition-transform duration-500"
        style={{
          width: `${totalWidth}px`,
          transform: transform,
          gap: `${CARD_GAP}px`,
        }}
      >
        {dataProduct.map((item) => (
          <div
            key={item._id}
            style={{
              flex: `0 0 ${itemWidth}px`,
            }}
          >
            <CardItem productItem={item} />
          </div>
        ))}
      </div>
    );
  }
};

export default memo(CardItemSlider);
