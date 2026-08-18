import { useIsMobile } from "@/hooks/useMediaQuery";
import Image from "next/image";
import Counter from "./Counter";
import { Trash } from "../icons";
import { cn } from "@/config/utils";
import ItemPrice from "./ItemPrice";
import { ICartItem } from "@/@types/Cart.type";

interface IProductItemProps {
  item: ICartItem;
  className?: string;
  /** true = màn cart (có Counter + nút xóa); false = dòng read-only (checkout) */
  isPayment?: boolean;
  onDeleteClick?: (variantId: string) => void;
  /** Gửi số lượng MỚI tuyệt đối (khớp BE update-quantity) */
  onQuantityChange?: (variantId: string, quantity: number) => void;
}

const ProductItem = ({
  item,
  className,
  isPayment,
  onDeleteClick,
  onQuantityChange,
}: IProductItemProps) => {
  const isMobile = useIsMobile();

  const handleCountChange = (newCount: number) => {
    if (newCount === item.quantity) return;
    onQuantityChange?.(item.variantId, newCount);
  };

  const attributeLabel = item.attributeValues
    .map((av) => av.value)
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(className, "flex gap-2 items-start py-5", {
        "opacity-60": !item.isAvailable,
      })}
    >
      <Image
        src={item.image || ""}
        alt={item.name}
        width={isPayment ? (isMobile ? 90 : 150) : 100}
        height={100}
        className="rounded-lg object-cover cursor-pointer aspect-square"
      />

      <div className="flex ml-2 w-full flex-col md:flex-row gap-4 md:gap-0 justify-between">
        <div className="flex flex-col justify-between w-full max-w-[350px]">
          <h2
            className={cn(
              "w-full text-lg cursor-pointer hover:underline mb-1",
              {
                "sm:line-clamp-2 line-clamp-1": isPayment,
                "line-clamp-2": !isPayment,
              }
            )}
          >
            {item.name}
          </h2>

          {!isPayment && (
            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
          )}
          {attributeLabel && (
            <div className="text-sm text-gray-400 mb-4">
              <span>{attributeLabel}</span>
            </div>
          )}

          {!item.isAvailable && (
            <p className="text-sm text-red mb-2">
              Sản phẩm tạm hết hàng — không tính vào tổng tiền
            </p>
          )}

          <ItemPrice
            price={item.price}
            originalPrice={
              item.originalPrice > item.price ? item.originalPrice : undefined
            }
            isShowDiscountPrice={item.discountPercentage > 0}
            isVertical={true}
          />
        </div>
        <div className="flex gap-32 justify-between md:justify-normal items-center md:items-start pl-4">
          {isPayment && item.isAvailable && (
            <Counter
              defaultValue={item.quantity}
              onChangeCount={handleCountChange}
              min={1}
              max={item.availableQuantity}
            />
          )}
          {isPayment && (
            <Trash
              className="cursor-pointer hover:opacity-70"
              onClick={() => onDeleteClick?.(item.variantId)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
