"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/config/utils";
import styles from "./ProductDescription.module.scss";

/** Chiều cao khung thu gọn — hằng dùng chung cho style lẫn phép đo overflow */
const COLLAPSED_HEIGHT = 208;

interface ProductDescriptionProps {
  descriptionHtml: string;
}

// Chốt vòng 3-agent review: heading h2 tĩnh đồng bộ section anh em, KHÔNG accordion
// (2 cơ chế thu gọn chồng nhau); clamp + fade + nút Xem thêm CHỈ hiện khi nội dung
// thực sự tràn khung
const ProductDescription = ({ descriptionHtml }: ProductDescriptionProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);

  // Đo trên chính nội dung (không phụ thuộc trạng thái clamp); ResizeObserver
  // cover font/ảnh load muộn và resize viewport làm đổi chiều cao
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () =>
      setIsOverflow(content.offsetHeight > COLLAPSED_HEIGHT);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [descriptionHtml]);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    // Thu gọn từ cuối nội dung dài làm trang co đột ngột, user rơi xuống section
    // dưới — đưa viewport về đầu khối (scroll-mt bù header fixed)
    if (!next) rootRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    // V2 (chốt section-rhythm): mô tả TRẦN — hairline dưới heading làm neo,
    // nền nhường cho khối Đánh giá (nhịp trang trắng → trắng → xám → trắng)
    <section ref={rootRef} className="scroll-mt-[var(--header-offset)]">
      <h2 className="type-display-sub font-display pb-4 border-b border-white-300 mb-5">
        Mô tả sản phẩm
      </h2>
      <div
        className={expanded ? undefined : "relative overflow-hidden"}
        style={expanded ? undefined : { maxHeight: COLLAPSED_HEIGHT }}
      >
        <div
          id="product-description-content"
          ref={contentRef}
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
        {/* Fade cho "Xem thêm" lý do thị giác (chốt D1) — from trùng nền trang qua
            token page (body bg-page), không hardcode white: rosier nền blush lộ dải trắng */}
        {!expanded && isOverflow && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-page via-page/80 to-page/0" />
        )}
      </div>
      {isOverflow && (
        <div className="flex justify-center mt-3">
          {/* Text link + chevron (cùng pattern SavedAddressList) thay pill outline —
              hợp hairline dưới heading; hit-area 40px qua after: */}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="product-description-content"
            onClick={handleToggle}
            className="relative inline-flex items-center gap-1.5 h-8 px-2 text-sm font-semibold text-primary-700 underline underline-offset-4 decoration-primary-200 hover:decoration-primary-700 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 after:absolute after:-inset-y-1 after:-inset-x-2"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
            <ChevronDown
              className={cn(
                "w-3 h-3 mt-px transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductDescription;
