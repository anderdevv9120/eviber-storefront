import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// Cầu nối ProductForm → ProductGallery (siblings qua server page, không prop-drill
// được): form đẩy ảnh của variant đang chọn, gallery nhảy tới ảnh đó nếu có trong
// bộ ảnh sản phẩm. Form reset null khi unmount để không rò sang trang product khác.
interface ProductGalleryState {
  variantImage: string | null;
  setVariantImage: (image: string | null) => void;
}

const useProductGalleryStore = create<ProductGalleryState>()(
  immer((set) => ({
    variantImage: null,

    setVariantImage: (image) =>
      set((state) => {
        state.variantImage = image;
      }),
  }))
);

export default useProductGalleryStore;
