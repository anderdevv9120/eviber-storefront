"use client";

import { ChevronDown } from "@/components/icons";
import { formatPrice } from "@/utils/formatPrice";
import { useEffect, useState } from "react";
import FilterPriceInput from "./FilterPriceInput";
import FilterPriceSlider from "./FilterPriceSlider";
import Accordion from "../Accordion";

interface FilterPriceProps {
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

const FilterPrice = ({ maxPrice, onChange }: FilterPriceProps) => {
  const [currentMinPrice, setCurrentMinPrice] = useState(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(maxPrice);

  // Đồng bộ khi maxPrice load bất đồng bộ (ban đầu có thể là 0)
  useEffect(() => {
    setCurrentMaxPrice(maxPrice);
  }, [maxPrice]);

  // Debounce để không gọi onChange (thường là gọi API) liên tục khi kéo slider
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange?.(currentMinPrice, currentMaxPrice);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [currentMinPrice, currentMaxPrice]);

  const handleMinChange = (value: number) => {
    if (value < 0) {
      value = 0;
    }
    setCurrentMinPrice(value);
  };

  const handleMaxChange = (value: number) => {
    setCurrentMaxPrice(value);
  };

  return (
    <Accordion headerTitle="Giá" className="border-b border-dark-50">
      <div className="flex justify-between items-center">
        <FilterPriceInput
          maxPrice={currentMaxPrice - 50}
          label="Từ"
          value={currentMinPrice}
          onChange={handleMinChange}
        />
        <ChevronDown className="-rotate-90 mt-7" />
        <FilterPriceInput
          maxPrice={maxPrice}
          minPrice={currentMinPrice + 50}
          label="Đến"
          value={currentMaxPrice}
          onChange={handleMaxChange}
        />
      </div>
      <FilterPriceSlider
        maxPrice={maxPrice}
        currentMinPrice={currentMinPrice}
        currentMaxPrice={currentMaxPrice}
        setCurrentMinPrice={setCurrentMinPrice}
        setCurrentMaxPrice={setCurrentMaxPrice}
      />

      <div className="flex justify-between pt-3">
        <p>{formatPrice(currentMinPrice * 1000)}</p>
        <p>{formatPrice(currentMaxPrice * 1000)}</p>
      </div>
    </Accordion>
  );
};

export default FilterPrice;
