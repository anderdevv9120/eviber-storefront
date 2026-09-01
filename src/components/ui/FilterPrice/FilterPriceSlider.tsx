"use client";

import { cn } from "@/config/utils";
import { useCallback, useEffect, useRef } from "react";
import "./FilterPrice.scss";

const classButton = "absolute top-1 w-full h-0 pointer-events-none";
const classThumb = "absolute z-10 w-full rounded-full h-1.5";

interface FilterPriceSliderProps {
  maxPrice: number;
  step?: number;
  currentMinPrice: number;
  currentMaxPrice: number;
  setCurrentMinPrice: (price: number) => void;
  setCurrentMaxPrice: (price: number) => void;
  /** Gọi khi user KẾT THÚC thao tác (thả chuột/chạm, nhả phím) — điểm commit giá trị */
  onCommit?: () => void;
}

const FilterPriceSlider = ({
  maxPrice,
  step = 1,
  currentMinPrice,
  currentMaxPrice,
  setCurrentMinPrice,
  setCurrentMaxPrice,
  onCommit,
}: FilterPriceSliderProps) => {
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  const getPercent = useCallback(
    (value: number) =>
      maxPrice > 0 ? Math.round((value / maxPrice) * 100) : 0,
    [maxPrice]
  );

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(currentMinPrice);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [currentMinPrice, getPercent]);

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(currentMaxPrice);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [currentMaxPrice, getPercent]);

  return (
    <div className="flex justify-center items-center mt-6 relative">
      <input
        type="range"
        min={0}
        max={maxPrice}
        step={step}
        value={currentMinPrice}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, currentMaxPrice - step);
          setCurrentMinPrice(value);
          event.target.value = value.toString();
        }}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className={cn(
          classButton,
          currentMinPrice <= maxPrice - step ? "z-30" : "z-50"
        )}
      />
      <input
        type="range"
        min={0}
        max={maxPrice}
        step={step}
        value={currentMaxPrice}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, currentMinPrice + step);
          setCurrentMaxPrice(value);
          event.target.value = value.toString();
        }}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className={cn(classButton, "z-20")}
      />

      <div className="relative w-full">
        <div className={cn(classThumb, "bg-white-500")} />
        <div ref={range} className={cn(classThumb, "bg-primary")} />
      </div>
    </div>
  );
};

export default FilterPriceSlider;
