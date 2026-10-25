import Image from "next/image";
import Link from "next/link";
import Counter from "@/components/ui/Counter";
import { TrashOutline } from "@/components/icons";
import { cn } from "@/config/utils";
import { formatPrice } from "@/utils/formatPrice";
import { ICartItem } from "@/@types/Cart.type";
import { PATH } from "@/constants/paths";
import { unavailableReason } from "@/utils/cartAvailability";

interface CartItemRowProps {
  item: ICartItem;
  /** Đổi giá trị để remount Counter về số server (Counter uncontrolled) */
  counterResetKey: number;
  isQuantityLocked: boolean;
  onDeleteClick: (variantId: string) => void;
  /** Gửi số lượng MỚI tuyệt đối (khớp BE update-quantity) */
  onQuantityChange: (variantId: string, quantity: number) => void;
}

const CartItemRow = ({
  item,
  counterResetKey,
  isQuantityLocked,
  onDeleteClick,
  onQuantityChange,
}: CartItemRowProps) => {
  const isOnSale = item.discountPercentage > 0;
  const lineTotal = item.price * item.quantity;
  const lineOriginalTotal = item.originalPrice * item.quantity;
  const productUrl = `${PATH.PRODUCT}/${item.slug}`;

  // Value số trần ("40") đứng một mình không rõ là size hay mã — kèm tên thuộc tính
  const attributeLabel = item.attributeValues
    .map((av) => (/^\d+$/.test(av.value) ? `${av.name} ${av.value}` : av.value))
    .filter(Boolean)
    .join(" · ");

  // Không early-return khi newCount === quantity server: phải đẩy xuống để
  // GHI ĐÈ pending cũ trong debounce (bấm + rồi − về số cũ) — CartView tự skip PUT thừa
  const handleCountChange = (newCount: number) => {
    onQuantityChange(item.variantId, newCount);
  };

  return (
    <div
      data-testid="cart-item"
      className={cn(
        "grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-start gap-x-4 md:gap-x-5 gap-y-1.5 md:gap-y-2.5 py-5 md:py-6 border-b border-white-500 border-dashed",
        !item.isAvailable && "opacity-60"
      )}
    >
      <Link
        href={productUrl}
        className="relative block w-28 md:w-32 aspect-square rounded-xl overflow-hidden bg-white-100 row-span-2 md:row-span-1"
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            width={128}
            height={128}
            className="w-full h-full object-cover mix-blend-multiply"
          />
        )}
      </Link>

      <div className="min-w-0 flex flex-col items-start gap-1 md:gap-1.5">
        <Link
          href={productUrl}
          className="font-semibold line-clamp-2 hover:text-primary-700 transition-colors"
        >
          {item.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-base font-semibold",
              isOnSale ? "text-terracotta" : "text-dark-800"
            )}
          >
            {formatPrice(lineTotal)}
          </span>
          {isOnSale && lineOriginalTotal > lineTotal && (
            <span className="text-xs text-dark-500 line-through">
              {formatPrice(lineOriginalTotal)}
            </span>
          )}
        </div>
        {attributeLabel && (
          <span className="bg-white-100 rounded-full px-3 py-0.5 text-xs font-semibold text-dark-500">
            {attributeLabel}
          </span>
        )}
        {!item.isAvailable && (
          <p className="text-sm text-red">
            {unavailableReason(item)} — không tính vào tổng tiền
          </p>
        )}
      </div>

      {/* Một instance duy nhất đổi vị trí bằng grid — 2 bản ẩn/hiện theo breakpoint
          sẽ lệch state Counter khi xoay màn hình */}
      <div className="col-start-2 row-start-2 md:col-start-3 md:row-start-1 flex items-center justify-between md:justify-end gap-2 md:self-center">
        {item.isAvailable ? (
          <Counter
            key={counterResetKey}
            variant="pill"
            size="sm-md"
            defaultValue={item.quantity}
            disabled={isQuantityLocked}
            onChangeCount={handleCountChange}
            min={1}
            max={item.availableQuantity}
          />
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-label="Xóa sản phẩm"
          data-testid="cart-item-remove"
          onClick={() => onDeleteClick(item.variantId)}
          disabled={isQuantityLocked}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-dark-400 hover:text-red hover:bg-white-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
        >
          <TrashOutline className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;
