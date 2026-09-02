import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getCart } from "@/apis/cart";
import { ICartResponse } from "@/@types/Cart.type";

interface CartState {
  /** null = chưa load xong lần nào (phân biệt với giỏ trống) */
  cart: ICartResponse | null;
  isFetching: boolean;
  hasError: boolean;
  /**
   * force=true cho refetch SAU MUTATION: request đang bay có thể phát trước khi
   * mutation commit — queue thêm 1 GET sau nó thay vì drop (drop là toast "Xóa
   * thành công" nhưng item vẫn hiện). Fetch nền (mount) để mặc định: join dedupe.
   */
  fetchCart: (force?: boolean) => Promise<void>;
}

// Promise in-flight giữ ngoài state — không cần reactive, chỉ để join/queue
let inflight: Promise<void> | null = null;
let rerunQueued = false;

// Không persist: guest cart sống bằng cookie sessionId phía BE — số lượng
// cache ở localStorage sẽ stale khi cookie đổi/hết hạn
export const useCartStore = create<CartState>()(
  immer((set) => ({
    cart: null,
    isFetching: false,
    hasError: false,
    fetchCart: async (force = false) => {
      if (inflight) {
        if (force) rerunQueued = true;
        return inflight;
      }
      inflight = (async () => {
        do {
          rerunQueued = false;
          set((state) => {
            state.isFetching = true;
          });
          try {
            const res = await getCart();
            set((state) => {
              state.cart = res?.data ?? null;
              state.hasError = false;
            });
          } catch {
            // interceptor không toast (toastError: false) — CartView có error UI riêng
            set((state) => {
              state.hasError = true;
            });
          } finally {
            set((state) => {
              state.isFetching = false;
            });
          }
        } while (rerunQueued);
      })();
      try {
        await inflight;
      } finally {
        inflight = null;
      }
    },
  }))
);
