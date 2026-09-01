"use client";

import { ChevronDown } from "@/components/icons";
import { cn } from "@/config/utils";
import { formatPrice } from "@/utils/formatPrice";
import { useEffect, useRef, useState } from "react";
import FilterPriceInput from "./FilterPriceInput";
import FilterPriceSlider from "./FilterPriceSlider";
import Accordion from "../Accordion";

interface FilterPriceProps {
  /** Đơn vị: đồng (giá trị thật, hiển thị trực tiếp qua formatPrice) */
  maxPrice: number;
  /** Bước nhảy của slider + khoảng cách tối thiểu giữa 2 đầu (đồng) */
  step?: number;
  title?: string;
  headerClassName?: string;
  className?: string;
  /** false = chỉ slider + nhãn giá (sidebar gọn), ẩn cặp input nhập tay */
  showInputs?: boolean;
  /** Giá trị khởi tạo (đồng) — caller đồng bộ từ ngoài (vd URL) thì remount bằng key */
  initialMin?: number;
  initialMax?: number;
  onChange: (min: number, max: number) => void;
}

const FilterPrice = ({
  maxPrice,
  step = 1,
  title = "Giá",
  headerClassName,
  className,
  showInputs = true,
  initialMin = 0,
  initialMax,
  onChange,
}: FilterPriceProps) => {
  const [currentMinPrice, setCurrentMinPrice] = useState(initialMin);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(
    initialMax ?? maxPrice
  );

  // Commit đọc qua ref, không qua closure: setState chưa kịp re-render lúc pointerup
  // bắn (state cũ), còn onChange giữ theo closure là bắn bản CŨ của caller — caller đã
  // re-render vì thao tác khác (checkbox/sort) trong lúc chờ thì commit ghi đè mất nó
  const latestValuesRef = useRef({
    min: initialMin,
    max: initialMax ?? maxPrice,
  });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Đồng bộ khi maxPrice load bất đồng bộ (ban đầu có thể là 0).
  // So sánh giá trị (không đếm lần chạy — StrictMode gọi effect 2 lần)
  // để mount không đè initialMax
  const prevMaxPriceRef = useRef(maxPrice);
  useEffect(() => {
    if (prevMaxPriceRef.current === maxPrice) return;
    prevMaxPriceRef.current = maxPrice;
    latestValuesRef.current.max = maxPrice;
    setCurrentMaxPrice(maxPrice);
  }, [maxPrice]);

  // Giá chỉ commit khi THẢ TAY: slider gọi commit ở pointerup/keyup,
  // không debounce theo từng nấc kéo — không có commit giữa chừng làm caller
  // remount slider ngay dưới con trỏ
  const commit = () => {
    onChangeRef.current?.(
      latestValuesRef.current.min,
      latestValuesRef.current.max
    );
  };

  const handleMinChange = (value: number) => {
    if (value < 0) {
      value = 0;
    }
    latestValuesRef.current.min = value;
    setCurrentMinPrice(value);
  };

  const handleMaxChange = (value: number) => {
    latestValuesRef.current.max = value;
    setCurrentMaxPrice(value);
  };

  // Cặp input nhập tay không có "thả tay" → commit debounce theo giá trị đã gõ
  const inputCommitTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    return () => clearTimeout(inputCommitTimerRef.current);
  }, []);
  const scheduleInputCommit = () => {
    clearTimeout(inputCommitTimerRef.current);
    inputCommitTimerRef.current = setTimeout(commit, 400);
  };

  return (
    <Accordion
      headerTitle={title}
      headerClassName={headerClassName}
      className={cn("border-b border-dark-50", className)}
    >
      {showInputs && (
        <div className="flex justify-between items-center">
          <FilterPriceInput
            maxPrice={currentMaxPrice - step}
            label="Từ"
            value={currentMinPrice}
            onChange={(value) => {
              handleMinChange(value);
              scheduleInputCommit();
            }}
          />
          <ChevronDown className="-rotate-90 mt-7" />
          <FilterPriceInput
            maxPrice={maxPrice}
            minPrice={currentMinPrice + step}
            label="Đến"
            value={currentMaxPrice}
            onChange={(value) => {
              handleMaxChange(value);
              scheduleInputCommit();
            }}
          />
        </div>
      )}
      <FilterPriceSlider
        maxPrice={maxPrice}
        step={step}
        currentMinPrice={currentMinPrice}
        currentMaxPrice={currentMaxPrice}
        setCurrentMinPrice={handleMinChange}
        setCurrentMaxPrice={handleMaxChange}
        onCommit={commit}
      />

      {/* Nhãn phụ của slider — tông nhẹ hơn item filter, không giành hierarchy */}
      <div className="flex justify-between pt-3 text-sm text-dark-500">
        <p>{formatPrice(currentMinPrice)}</p>
        <p>{formatPrice(currentMaxPrice)}</p>
      </div>
    </Accordion>
  );
};

export default FilterPrice;
