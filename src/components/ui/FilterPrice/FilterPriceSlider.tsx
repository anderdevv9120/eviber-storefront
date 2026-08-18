"use client";

import { cn } from "@/config/utils";
import { useCallback, useEffect, useRef } from "react";
import "./FilterPrice.scss";

const classButton = "absolute top-1 w-full h-0 shadow-md pointer-events-none";
const classThumb = "absolute z-10 w-full rounded-sm h-1";

interface FilterPriceSliderProps {
  maxPrice: number;
  currentMinPrice: number;
  currentMaxPrice: number;
  setCurrentMinPrice: (price: number) => void;
  setCurrentMaxPrice: (price: number) => void;
}

const FilterPriceSlider = ({
  maxPrice,
  currentMinPrice,
  currentMaxPrice,
  setCurrentMinPrice,
  setCurrentMaxPrice,
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
        value={currentMinPrice}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, currentMaxPrice - 10);
          setCurrentMinPrice(value);
          event.target.value = value.toString();
        }}
        className={cn(
          classButton,
          currentMinPrice <= maxPrice - 1 ? "z-30" : "z-50"
        )}
      />
      <input
        type="range"
        min={0}
        max={maxPrice}
        value={currentMaxPrice}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, currentMinPrice + 10);
          setCurrentMaxPrice(value);
          event.target.value = value.toString();
        }}
        className={cn(classButton, "z-20")}
      />

      <div className="relative w-full">
        <div className={cn(classThumb, "bg-dark-100")} />
        <div ref={range} className={cn(classThumb, "bg-primary-700")} />
      </div>
    </div>
  );
};

export default FilterPriceSlider;
