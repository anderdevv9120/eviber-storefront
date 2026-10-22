"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  removeComboFromCart,
  removeFromCart,
  updateComboQuantity,
  updateQuantity,
} from "@/apis/cart";
import { getCountdownStorageKey } from "@/components/ui/CountdownTimer";
import { removeLocalStorage } from "@/utils/localStorage";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/formatPrice";
import { successToast } from "@/utils/toast";
import { cn } from "@/config/utils";
import { PATH } from "@/constants/paths";
import { RightArrow } from "@/components/icons";
import CartItemRow from "./CartItemRow";
import CartComboRow from "./CartComboRow";

export default function CartView() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const isFetching = useCartStore((s) => s.isFetching);
  const hasError = useCartStore((s) => s.hasError);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lineToRemove, setLineToRemove] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  // Remount Counter khi PUT fail — Counter uncontrolled nên số optimistic
  // không tự quay về giá trị server sau resync
  const [counterResetKey, setCounterResetKey] = useState(0);
  // Mỗi cart line có cửa sổ debounce riêng; product và combo không trùng ID.
  const pendingRef = useRef(
    new Map<
      string,
      { quantity: number; timer: ReturnType<typeof setTimeout> }
    >()
  );
  const inflightRef = useRef(new Map<string, Promise<boolean>>());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    removeLocalStorage(getCountdownStorageKey(PATH.CART));
  }, []);

  const flushPendingUpdate = async (key: string): Promise<boolean> => {
    // A new edit can arrive while a PUT for the same line is running.
    const previous = inflightRef.current.get(key);
    if (previous && !(await previous)) return false;

    const pending = pendingRef.current.get(key);
    if (!pending) return true;
    pendingRef.current.delete(key);
    clearTimeout(pending.timer);

    const isCombo = key.startsWith("combo:");
    const id = key.slice(isCombo ? 6 : 8);
    const cartNow = useCartStore.getState().cart;
    const current = isCombo
      ? cartNow?.combos.find((line) => line.lineId === id)
      : cartNow?.items.find((item) => item.variantId === id);
    if (!current || current.quantity === pending.quantity) return true;

    const request = (async () => {
      try {
        if (isCombo) {
          await updateComboQuantity({ lineId: id, quantity: pending.quantity });
        } else {
          await updateQuantity({ variantId: id, quantity: pending.quantity });
        }
        await fetchCart(true);
        successToast("Cập nhật số lượng thành công");
        return true;
      } catch {
        await fetchCart(true);
        setCounterResetKey((k) => k + 1);
        return false;
      }
    })();
    inflightRef.current.set(key, request);
    try {
      return await request;
    } finally {
      if (inflightRef.current.get(key) === request)
        inflightRef.current.delete(key);
    }
  };

  const queueQuantityChange = (key: string, quantity: number) => {
    const old = pendingRef.current.get(key);
    if (old) clearTimeout(old.timer);
    const timer = setTimeout(() => {
      flushPendingUpdate(key).catch(() => {});
    }, 1000);
    pendingRef.current.set(key, { quantity, timer });
  };

  // Unmount giữa cửa sổ debounce → update cuối bị nuốt im lặng; flush fire-and-forget
  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      for (const key of pending.keys()) {
        flushPendingUpdate(key).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteClick = (key: string) => {
    setLineToRemove(key);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsModalOpen(false);
    setIsMutating(true);
    try {
      const queued = pendingRef.current.get(lineToRemove);
      if (queued) clearTimeout(queued.timer);
      pendingRef.current.delete(lineToRemove);
      await inflightRef.current.get(lineToRemove);
      if (lineToRemove.startsWith("combo:")) {
        await removeComboFromCart({ lineId: lineToRemove.slice(6) });
      } else {
        await removeFromCart({ variantId: lineToRemove.slice(8) });
      }
      await fetchCart(true);
      successToast("Xóa khỏi giỏ hàng thành công");
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setIsMutating(false);
    }
  };

  const handleCheckout = async () => {
    setIsMutating(true);
    // Checkout phải chờ cả các PUT đang chạy và những dòng còn debounce.
    const keys = new Set([
      ...inflightRef.current.keys(),
      ...pendingRef.current.keys(),
    ]);
    const updated = await Promise.all(
      [...keys].map((key) => flushPendingUpdate(key))
    );
    if (updated.some((ok) => !ok)) {
      setIsMutating(false);
      return;
    }
    if (keys.size > 0) await fetchCart(true);
    router.push(PATH.CHECKOUT);
  };

  const items = cart?.items ?? [];
  const combos = cart?.combos ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;
  // cart null = chưa có data lần nào → skeleton NGAY CẢ frame đầu trước khi
  // effect fetch kịp chạy (điều kiện đòi isFetching là flash "0 sản phẩm" 1 nhịp);
  // retry đang bay (hasError + isFetching) cũng quay về skeleton
  const isLoadFailed = !cart && hasError && !isFetching;
  const isInitialLoading = !cart && !isLoadFailed;
  const isEmpty = !!cart && items.length === 0 && combos.length === 0;
  // BE chỉ đếm item còn hàng vào totalQuantity — giỏ toàn hàng hết là "0 sản phẩm"
  // trong khi list vẫn hiện hàng mờ, phải nói rõ thay vì hiện số 0 mâu thuẫn
  const isAllOutOfStock =
    !!cart && (items.length > 0 || combos.length > 0) && totalQuantity === 0;

  // Sticky bar mobile chỉ hiện khi panel summary nằm ngoài viewport (list dài);
  // summary cuộn vào tầm nhìn thì bar rút xuống
  const summaryRef = useRef<HTMLElement>(null);
  // init true = bar ẩn mặc định — init false là bar chớp 1 nhịp trên trang ngắn
  // trước khi IntersectionObserver kịp chạy
  const [isSummaryInView, setIsSummaryInView] = useState(true);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSummaryInView(entry.isIntersecting),
      // 0.3 — bar chỉ rút khi phần đáng kể của summary đã thấy được, tránh nhấp nháy ở mép
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isInitialLoading, isLoadFailed, isEmpty]);

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold">Giỏ hàng</h1>
      {!isEmpty && !isLoadFailed && (
        <p className="text-sm text-dark-500 mt-1" data-testid="cart-count">
          {isInitialLoading
            ? "Đang tải giỏ hàng..."
            : isAllOutOfStock
              ? "Tất cả sản phẩm trong giỏ hiện không mua được"
              : `${totalQuantity} sản phẩm trong giỏ`}
        </p>
      )}

      {isInitialLoading && <CartSkeleton />}

      {isLoadFailed && (
        <div className="flex flex-col items-center text-center py-14">
          <p className="text-dark-500 mb-5">
            Không tải được giỏ hàng. Kiểm tra kết nối rồi thử lại.
          </p>
          <Button variant="outline" onClick={() => fetchCart()}>
            Thử lại
          </Button>
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center text-center pt-8 pb-6">
          <EmptyCartIllustration className="w-40 md:w-52 mb-5" />
          <h2 className="text-xl font-bold mb-1">Giỏ hàng đang trống</h2>
          <p className="text-sm text-dark-500 mb-6 max-w-xs">
            Khám phá bộ sưu tập mới — thêm món đầu tiên vào giỏ để bắt đầu.
          </p>
          <Button size="lg" onClick={() => router.push(PATH.COLLECTION)}>
            Khám phá sản phẩm
          </Button>
        </div>
      )}

      {!isInitialLoading && !isLoadFailed && !isEmpty && (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-2 items-start">
          <div className="w-full lg:flex-1">
            {items.map((item) => (
              <CartItemRow
                key={item.variantId}
                item={item}
                counterResetKey={counterResetKey}
                onDeleteClick={(variantId) =>
                  handleDeleteClick(`product:${variantId}`)
                }
                onQuantityChange={(variantId, qty) =>
                  queueQuantityChange(`product:${variantId}`, qty)
                }
              />
            ))}
            {combos.map((line) => (
              <CartComboRow
                key={line.lineId}
                line={line}
                counterResetKey={counterResetKey}
                onDeleteClick={(lineId) => handleDeleteClick(`combo:${lineId}`)}
                onQuantityChange={(lineId, qty) =>
                  queueQuantityChange(`combo:${lineId}`, qty)
                }
              />
            ))}

            <Link
              href={PATH.COLLECTION}
              className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-500 transition-colors mt-5"
            >
              Tiếp tục mua sắm
              <RightArrow className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>

          <aside
            ref={summaryRef}
            className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24 bg-white border border-white-200 rounded-xl shadow-card p-6 md:p-7"
            data-testid="cart-summary"
          >
            <h2 className="text-base font-bold mb-4">Tổng đơn hàng</h2>
            <SummaryRows
              totalQuantity={totalQuantity}
              totalOriginalPrice={cart?.totalOriginalPrice ?? 0}
              totalSavings={cart?.totalSavings ?? 0}
            />
            <div className="flex justify-between items-baseline border-t border-white-500 pt-3.5 mt-3.5 mb-5">
              <span className="text-sm font-semibold">Tổng cộng</span>
              <span className="text-2xl font-extrabold">
                {formatPrice(cart?.totalPrice ?? 0)}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              loading={isMutating}
              disabled={totalQuantity === 0}
            >
              Thanh toán
            </Button>
            <p className="text-xs text-dark-500 text-center mt-3">
              {isAllOutOfStock
                ? "Xóa sản phẩm hết hàng hoặc quay lại khi có hàng để tiếp tục thanh toán"
                : "Miễn phí vận chuyển cho mọi đơn hàng"}
            </p>
          </aside>

          <div
            data-testid="cart-sticky-bar"
            className={cn(
              "lg:hidden fixed bottom-3 inset-x-4 z-40 flex items-center gap-4 bg-white border border-white-200 rounded-xl shadow-card-hover px-4 py-3 transition-all duration-300",
              isSummaryInView
                ? "translate-y-[120%] opacity-0 pointer-events-none"
                : "translate-y-0 opacity-100"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-dark-500 truncate">
                Tổng cộng · {totalQuantity} sản phẩm
              </p>
              <p className="text-lg font-extrabold">
                {formatPrice(cart?.totalPrice ?? 0)}
              </p>
            </div>
            <Button
              className="px-7"
              onClick={handleCheckout}
              loading={isMutating}
              disabled={totalQuantity === 0}
            >
              Thanh toán
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleDeleteConfirm}
        title="Xác nhận xóa"
        okText="Đồng ý"
        cancelText="Bỏ qua"
      >
        <p>
          Bạn có muốn xóa{" "}
          {lineToRemove.startsWith("combo:") ? "combo" : "sản phẩm"} ra khỏi giỏ
          hàng ?
        </p>
      </Modal>
    </>
  );
}

interface SummaryRowsProps {
  totalQuantity: number;
  totalOriginalPrice: number;
  totalSavings: number;
}

function SummaryRows({
  totalQuantity,
  totalOriginalPrice,
  totalSavings,
}: SummaryRowsProps) {
  return (
    <div className="flex flex-col gap-2.5 text-sm text-dark-500">
      <div className="flex justify-between">
        <span>{`Tạm tính (${totalQuantity} sản phẩm)`}</span>
        <span className="font-semibold text-dark-800">
          {formatPrice(totalOriginalPrice)}
        </span>
      </div>
      {totalSavings > 0 && (
        <div className="flex justify-between">
          <span>Tiết kiệm</span>
          <span className="font-semibold text-terracotta">
            −{formatPrice(totalSavings)}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Vận chuyển</span>
        <span className="font-semibold text-dark-800">Miễn phí</span>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mt-2 items-start animate-pulse">
      <div className="w-full lg:flex-1">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex gap-4 md:gap-6 py-5 md:py-6 border-b border-white-500 last:border-b-0"
          >
            <div className="w-28 md:w-32 aspect-square rounded-xl bg-white-200 shrink-0" />
            <div className="flex-1 flex flex-col gap-2 pt-1">
              <div className="h-4 w-2/3 rounded bg-white-200" />
              <div className="h-4 w-28 rounded bg-white-200" />
              <div className="h-6 w-24 rounded-full bg-white-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden lg:block w-[400px] h-72 rounded-xl bg-white-100 shrink-0" />
    </div>
  );
}

/**
 * Illustration túi shopping line-art cho empty state (cart + checkout) — vẽ tay theo
 * bộ stroke của site, cỡ lớn (viewBox 200) nên stroke đặt theo px tuyệt đối
 */
export function EmptyCartIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 170" fill="none" className={className} aria-hidden>
      {/* bóng đổ */}
      <ellipse cx="100" cy="156" rx="52" ry="7" className="fill-white-200" />
      {/* thân túi nghiêng nhẹ */}
      <g transform="rotate(-3 100 105)">
        <path
          d="M57 62h86l-7.5 82a9 9 0 0 1-9 8.2H73.5a9 9 0 0 1-9-8.2L57 62Z"
          className="fill-white-50 stroke-dark-300"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* quai túi — accent Pine */}
        <path
          d="M78 62V48a22 22 0 0 1 44 0v14"
          className="stroke-primary-500"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* nếp gấp đáy túi */}
        <path
          d="M66 128h68"
          className="stroke-white-600"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      {/* chi tiết trang trí bay quanh */}
      <circle cx="44" cy="52" r="3" className="fill-primary-200" />
      <circle cx="160" cy="44" r="4" className="fill-white-600" />
      <circle cx="168" cy="96" r="3" className="fill-primary-100" />
      <path
        d="M36 92c4-1.5 6-3.5 7-8 1 4.5 3 6.5 7 8-4 1.5-6 3.5-7 8-1-4.5-3-6.5-7-8Z"
        className="fill-primary-300"
      />
      <path
        d="M152 18c2.6-1 4-2.3 4.6-5.2.7 2.9 2 4.2 4.6 5.2-2.6 1-4 2.3-4.6 5.2-.7-2.9-2-4.2-4.6-5.2Z"
        className="fill-white-600"
      />
    </svg>
  );
}
