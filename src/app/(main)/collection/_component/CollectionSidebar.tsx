"use client";

import { useRef } from "react";
import { dataFilter } from "@/mocks/fetchData";
import { XMark } from "@/components/icons";
import Filter from "@/components/ui/Filter";
import FilterPrice from "@/components/ui/FilterPrice";
import Accordion from "@/components/ui/Accordion";
import SelectorColor from "@/components/ui/SelectorColor";
import useFilterCollectionStore from "@/store/useFilterCollectionStore";
import useClickOutside from "@/hooks/useClickOutside";
import { useWindowSize } from "@/hooks";

export default function CollectionSidebar() {
  const { isShowFilters, setIsShowFilters } = useFilterCollectionStore();
  const isSideBarVisible = useWindowSize();
  const collectionSidebarRef = useRef<HTMLDivElement>(null);

  useClickOutside(collectionSidebarRef, () => setIsShowFilters(false));

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="flex-col hidden lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isSideBarVisible && (
        <div
          className={`fixed inset-0 z-50 transition-transform duration-300 bg-dark-overlay ${
            isShowFilters
              ? "transform translate-x-0"
              : "transform -translate-x-full"
          } flex`}
        >
          <div
            className="bg-white h-full p-4 shadow-lg overflow-y-auto"
            ref={collectionSidebarRef}
          >
            <div className="flex justify-between mb-4 pb-4 border-b border-b-dark-50">
              <div className="inline-block font-semibold text-2xl">
                Tìm kiếm nâng cao
              </div>

              <button onClick={() => setIsShowFilters(false)}>
                <XMark />
              </button>
            </div>

            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}

const SidebarContent = () => {
  const setSelectedColor = useFilterCollectionStore(
    (state) => state.setSelectedColor
  );
  const setSelectedPriceRange = useFilterCollectionStore(
    (state) => state.setSelectedPriceRange
  );
  const setFiltersProducts = useFilterCollectionStore(
    (state) => state.setFiltersProducts
  );

  const colors = [
    "#DBBCB4",
    "#D3CDC7",
    "#33496C",
    "#FFC961",
    "#D9A767",
    "#A35427",
  ];

  return (
    <div className="w-[270px] xl:mb-0 mb-10">
      <Filter
        data={dataFilter}
        className="mb-4"
        onChange={setFiltersProducts}
      />

      <FilterPrice maxPrice={1000} onChange={setSelectedPriceRange} />

      {colors.length && (
        <Accordion headerTitle="Màu sắc">
          <SelectorColor
            title=""
            defaultValue={colors[0]}
            colors={colors}
            onChangeColor={setSelectedColor}
            className="pl-1 pb-1"
          />
        </Accordion>
      )}
    </div>
  );
};
