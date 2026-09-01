import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// Store chỉ giữ UI state của màn collection (mở/đóng drawer filter mobile);
// filter/sort/page là URL searchParams — không đưa vào store.
interface FilterCollectionState {
  isShowFilters: boolean;
  setIsShowFilters: (isShow: boolean) => void;
}

const useFilterCollectionStore = create<FilterCollectionState>()(
  immer((set) => ({
    isShowFilters: false,

    setIsShowFilters: (isShow) =>
      set((state) => {
        state.isShowFilters = isShow;
      }),
  }))
);

export default useFilterCollectionStore;
