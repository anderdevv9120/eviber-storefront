import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface FilterSettings {
  dropdownValue: string;
  selectedColor: string;
  selectedPriceRange: { min: number; max: number };
  filtersProducts: { [key: string]: BaseValueInputType[] };
}

interface FilterCollectionState {
  isShowFilters: boolean;
  setIsShowFilters: (isShow: boolean) => void;
  filterData: FilterSettings;
}

interface FilterCollectionActions {
  setDropdownValue: (selectedValue: string) => void;
  setSelectedColor: (color: string) => void;
  setSelectedPriceRange: (min: number, max: number) => void;
  setFiltersProducts: (filtersProducts: {
    [key: string]: BaseValueInputType[];
  }) => void;
}

const useFilterCollectionStore = create<
  FilterCollectionState & FilterCollectionActions
>()(
  immer((set) => ({
    isShowFilters: false,
    filterData: {
      dropdownValue: "",
      selectedColor: "",
      selectedPriceRange: { min: 0, max: 1000 },
      filtersProducts: {},
    },

    setIsShowFilters: (isShow) =>
      set((state) => {
        state.isShowFilters = isShow;
      }),

    setDropdownValue: (selectedValue) =>
      set((state) => {
        state.filterData.dropdownValue = selectedValue;
      }),

    setSelectedColor: (color) =>
      set((state) => {
        state.filterData.selectedColor = color;
      }),

    setSelectedPriceRange: (min, max) =>
      set((state) => {
        state.filterData.selectedPriceRange = { min, max };
      }),

    setFiltersProducts: (filtersProducts) => {
      set((state) => {
        state.filterData.filtersProducts = filtersProducts;
      });
    },
  }))
);

export default useFilterCollectionStore;
