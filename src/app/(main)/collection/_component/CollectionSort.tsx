"use client";

import Dropdown from "@/components/ui/Dropdown";
import { FilterIcon } from "@/components/icons";
import useFilterCollection from "@/store/useFilterCollectionStore";

export default function CollectionSort() {
  const { setDropdownValue } = useFilterCollection();
  const { isShowFilters, setIsShowFilters } = useFilterCollection();

  return (
    <div className="flex justify-between pb-6 items-center">
      <button
        className="gap-2 md:hidden flex items-center px-2 py-1 rounded-md h-8 border border-dark-200"
        onClick={() => {
          setIsShowFilters(!isShowFilters);
        }}
      >
        <FilterIcon />
        <p className="text-base md:text-lg">Bộ lọc</p>
      </button>

      <div className="md:flex gap-2 items-center hidden">
        <FilterIcon className="w-5 h-5" />
        <p className="text-base md:text-2xl">Bộ lọc tìm kiếm</p>
      </div>

      <div className="flex gap-3 items-center">
        <span className="text-lg hidden md:block">Sắp xếp theo:</span>
        <Dropdown
          size="sm"
          placeholder="Sắp xếp theo"
          className="w-40 md:w-60 h-11"
          options={[
            { value: "BC", label: "Bán chạy nhất" },
            { value: "GT", label: "Giá tăng dần" },
            { value: "GG", label: "Giá giảm dần" },
          ]}
          onChange={setDropdownValue}
        />
      </div>
    </div>
  );
}
