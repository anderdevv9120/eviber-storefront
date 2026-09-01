import { formatPrice } from "@/utils/formatPrice";
import { formatDate } from "@/utils/formatTime";
import ItemPrice from "@/components/ui/ItemPrice";
import Modal from "@/components/ui/Modal";
import Spin from "@/components/ui/Spin";
import { cn } from "@/config/utils";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { IOrderResponse, IOrderProduct } from "@/@types/Order.type";
import { statusStyles, OrderStatus } from "@/constants/orderStatus";
import { PATH } from "@/constants/paths";
import { cancelOrder } from "@/apis/order";
import { successToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OrderProps {
  order: IOrderResponse;
  isLastItem: boolean;
  /** Gọi sau khi hủy đơn thành công để parent refetch danh sách */
  onCancelled?: () => void;
}

// Map màu đặt tại đây (vùng Tailwind content scan) — để trong constants/ là class
// không được generate, mất màu im lặng (đã cắn với text-yellow/text-red-500).
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "text-blue-400",
  confirmed: "text-primary-600",
  shipped: "text-yellow",
  delivered: "text-green",
  cancelled: "text-red-500",
  returned: "text-red-400",
};

const renderStatus = (status: string) => {
  const isKnown = status in statusStyles;
  const label = isKnown
    ? statusStyles[status as OrderStatus].label
    : "Trạng thái không xác định";
  const color = isKnown ? STATUS_COLOR[status as OrderStatus] : "text-gray";

  return <span className={cn("font-medium", color)}>{label}</span>;
};

const attributeLabel = (product: IOrderProduct) =>
  (product.attributeValuesAtOrder ?? [])
    .map((av) => av.value)
    .filter(Boolean)
    .join(" · ");

const OrderItem = ({ order, isLastItem, onCancelled }: OrderProps) => {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { created_at, status, productInfo, checkoutInfo, orderNumber } = order;

  const totalQuantity = productInfo.reduce((sum, p) => sum + p.quantity, 0);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(order._id);
      successToast("Đã hủy đơn hàng, tồn kho đã được hoàn lại");
      setIsConfirmOpen(false);
      onCancelled?.();
    } catch {
      // interceptor đã toast lỗi (vd đơn vừa được xác nhận) — đóng modal để user thấy trạng thái mới
      setIsConfirmOpen(false);
      onCancelled?.();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex justify-between">
          <div className="text-dark-600">
            <p>{formatDate(created_at, "MM/DD/YY")}</p>
            {orderNumber && (
              <p className="text-xs text-gray-500">Mã đơn: {orderNumber}</p>
            )}
          </div>
          {renderStatus(status)}
        </div>

        {productInfo.map((product) => (
          <div key={product.variantId} className="flex gap-4 mt-4 w-full">
            <Image
              src={product.variantImageAtOrder || "/images/EmptyCollection.jpg"}
              alt={product.productNameAtOrder ?? "Sản phẩm"}
              width={140}
              height={140}
              className="object-cover w-24 h-24 rounded-lg cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = "/images/EmptyCollection.jpg";
              }}
            />
            <div className="flex flex-col flex-grow">
              <div className="flex-1 mb-1 text-gray-400">
                <h3
                  className="text-base lg:text-lg text-dark-500 line-clamp-2 text-ellipsis cursor-pointer hover:underline"
                  // Snapshot đơn không lưu slug — PDP nhận segment là ObjectId,
                  // resolve rồi redirect về URL slug canonical
                  onClick={() =>
                    router.push(`${PATH.PRODUCT}/${product.productId}`)
                  }
                >
                  {product.productNameAtOrder ?? "Sản phẩm"}
                </h3>
                {attributeLabel(product) && (
                  <span className="text-sm">{attributeLabel(product)}</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <ItemPrice
                  price={product.priceAtOrder}
                  originalPrice={
                    product.originalPriceAtOrder > product.priceAtOrder
                      ? product.originalPriceAtOrder
                      : undefined
                  }
                  currentPriceClass="text-lg"
                />
                <span>x{product.quantity}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end items-center gap-2 mt-4">
          <span>Tổng cộng ({totalQuantity} sản phẩm) :</span>
          <p className="text-primary-800 text-lg font-medium">
            {formatPrice(checkoutInfo.totalPrice)}
          </p>
        </div>

        <div className="flex justify-end items-center gap-2">
          {status === "pending" && (
            <Button
              type="button"
              className="w-1/3 my-4 hover:opacity-80 text-red border-red"
              variant="outlined"
              onClick={() => setIsConfirmOpen(true)}
            >
              Hủy đơn
            </Button>
          )}
          <Button
            type="button"
            className="w-1/3 my-4 hover:opacity-80"
            variant="outlined"
          >
            Đánh giá
          </Button>
          <Button type="button" className="w-1/3 my-4 hover:opacity-80">
            Mua lại
          </Button>
        </div>

        <Modal
          isOpen={isConfirmOpen}
          title="Hủy đơn hàng"
          okText={isCancelling ? "Đang hủy..." : "Hủy đơn"}
          cancelText="Giữ đơn"
          onOk={isCancelling ? undefined : handleCancelOrder}
          onCancel={() => !isCancelling && setIsConfirmOpen(false)}
        >
          <Spin
            isLoading={isCancelling}
            className="text-dark-200 fill-primary-500"
          >
            <p>
              Bạn chắc chắn muốn hủy đơn
              {orderNumber ? ` ${orderNumber}` : " này"}? Sản phẩm sẽ được hoàn
              lại kho và thao tác không thể hoàn tác.
            </p>
          </Spin>
        </Modal>
      </div>

      {!isLastItem && (
        <hr className="-mx-4 mb-4 border-t-[16px] border-white-100" />
      )}
    </>
  );
};

export default OrderItem;
