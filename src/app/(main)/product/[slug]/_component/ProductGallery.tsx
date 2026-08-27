"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/config/utils";
import ButtonChevron from "@/components/ui/ButtonChevron";
import useCustomSwipeable from "@/hooks/useCustomSwipeable";
import useProductGalleryStore from "@/store/useProductGalleryStore";

// Hàng thumbnail = dải trượt căn tâm (chốt vòng refine 2, user revert lại sau khi
// thử ô cố định 72px): LUÔN 5 ô lấp 100% bề ngang, không ô "+N"; ảnh active trượt
// về giữa dải, clamp ở 2 đầu. Sản phẩm ≤5 ảnh: dải đứng yên.
const VISIBLE_THUMBS = 5;
// Gap dùng CHUNG cho CSS track + phép tính transform (pattern CARD_GAP của
// CardItemSlider) — đổi gap chỉ sửa hằng này, không gắn class gap-* vào track
const THUMB_GAP = 8;

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const ProductGallery = ({ images, name }: ProductGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  // Ref đo width đặt ở wrapper KHÔNG padding — offsetWidth tính cả padding
  const thumbsWrapRef = useRef<HTMLDivElement>(null);

  const imagesLength = images.length;

  // Chọn variant có ảnh riêng (ProductForm đẩy qua store) → nhảy tới ảnh đó;
  // ảnh variant không thuộc bộ images thì đứng yên (không chèn ảnh lạ vào dải)
  const variantImage = useProductGalleryStore((s) => s.variantImage);
  useEffect(() => {
    if (!variantImage) return;
    const index = images.indexOf(variantImage);
    if (index >= 0) setCurrentIndex(index);
  }, [variantImage, images]);

  useEffect(() => {
    const measure = () => {
      if (thumbsWrapRef.current) {
        const width = thumbsWrapRef.current.offsetWidth;
        setThumbWidth(
          (width - (VISIBLE_THUMBS - 1) * THUMB_GAP) / VISIBLE_THUMBS
        );
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Ô active nằm giữa dải (vị trí 3/5), clamp để 2 đầu không lòi khoảng trống
  const maxStart = Math.max(0, imagesLength - VISIBLE_THUMBS);
  const windowStart = Math.min(
    Math.max(currentIndex - Math.floor(VISIBLE_THUMBS / 2), 0),
    maxStart
  );

  const handlePrev = () => {
    if (imagesLength <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? imagesLength - 1 : prev - 1));
  };

  const handleNext = () => {
    if (imagesLength <= 1) return;
    setCurrentIndex((prev) => (prev === imagesLength - 1 ? 0 : prev + 1));
  };

  const swipeHandlers = useCustomSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
  });

  if (imagesLength === 0) {
    return (
      <div className="flex items-center justify-center aspect-square rounded-xl bg-white-100 text-dark-400">
        Chưa có hình ảnh
      </div>
    );
  }

  return (
    // min-w-0: là grid item — thiếu thì min-content của track slide (shrink-0)
    // banh rộng cột, cả trang scroll ngang ở mobile/tablet (đã dính ở 768)
    <div className="min-w-0">
      <div
        {...swipeHandlers}
        className="relative overflow-hidden rounded-xl bg-white-100 group/rail"
      >
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((imageUrl, index) => (
            <div key={index} className="w-full shrink-0">
              <Image
                src={imageUrl}
                alt={`${name} — ảnh ${index + 1}`}
                width={900}
                height={1200}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                // Desktop cap chiều cao (chốt /ui-audit — ảnh 4/5 full cột kéo dài hơn cột info)
                // vuông mọi breakpoint (mobile 4:5 chiếm quá nửa viewport; desktop đồng bộ luôn — chốt vòng mobile-refine)
                className="w-full aspect-square object-cover mix-blend-multiply"
              />
            </div>
          ))}
        </div>

        {imagesLength > 1 && (
          <>
            <ButtonChevron onClick={handlePrev} />
            <ButtonChevron isRightButton onClick={handleNext} />

            {/* Mobile không có thumbnails (chốt mockup H2) — điều hướng bằng dots + vuốt */}
            <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Xem ảnh ${index + 1}`}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    // Hit-area giả ~40px (chuẩn touch target), visual giữ 8px (pattern heart CardItem)
                    "relative w-2 h-2 rounded-full transition-colors ring-1 ring-dark-overlay after:absolute after:-inset-y-4 after:-inset-x-[3px] after:content-['']",
                    index === currentIndex ? "bg-primary-600" : "bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {imagesLength > 1 && (
        <div
          ref={thumbsWrapRef}
          className="hidden md:block mt-3 overflow-hidden"
        >
          <div
            className={cn(
              "flex transition-transform duration-300",
              // <5 ảnh: dải đứng yên — căn giữa cho cân dưới ảnh vuông (chốt /ui-audit vòng 2)
              imagesLength < VISIBLE_THUMBS && "justify-center"
            )}
            style={{
              gap: THUMB_GAP,
              transform: `translateX(-${windowStart * (thumbWidth + THUMB_GAP)}px)`,
            }}
          >
            {images.map((imageUrl, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Xem ảnh ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                style={{
                  // Fallback calc cho lần render đầu (chưa đo được container)
                  width: thumbWidth
                    ? `${thumbWidth}px`
                    : `calc((100% - ${(VISIBLE_THUMBS - 1) * THUMB_GAP}px) / ${VISIBLE_THUMBS})`,
                }}
                className={cn(
                  // bg-white-100: ảnh lỗi/chưa load vẫn thấy ô, không thành khoảng trắng tàng hình
                  "shrink-0 aspect-square rounded-lg overflow-hidden border-[3px] bg-white-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
                  // Active = border Pine quanh ảnh (chốt vòng refine 2)
                  index === currentIndex
                    ? "border-primary-700"
                    : "border-transparent hover:border-white-600"
                )}
              >
                <Image
                  src={imageUrl}
                  alt={`${name} — thumbnail ${index + 1}`}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
