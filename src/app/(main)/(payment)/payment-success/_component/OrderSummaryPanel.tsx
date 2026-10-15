import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PATH } from "@/constants/paths";
import { formatCouponDiscountLabel, formatPrice } from "@/utils/formatPrice";
import { IOrderCheckoutInfo, IOrderProduct } from "@/@types/Order.type";

interface OrderSummaryPanelProps {
  products: IOrderProduct[];
  checkoutInfo: IOrderCheckoutInfo;
  /** Hành động phụ cạnh tiêu đề: xem sổ đơn (đăng nhập) hoặc sao chép link tra cứu (guest) */
  headerAction?: ReactNode;
  children?: ReactNode;
}

export default function OrderSummaryPanel({
  products,
  checkoutInfo,
  headerAction,
  children,
}: OrderSummaryPanelProps) {
  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = checkoutInfo.subtotal;
  const savings = products.reduce(
    (sum, item) =>
      sum +
      Math.max(item.originalPriceAtOrder - item.priceAtOrder, 0) *
        item.quantity,
    0
  );
  const shippingFee = checkoutInfo.shippingFee ?? 0;
  // Giảm giá của mã voucher BE đã chốt lúc đặt — tách khỏi "Tiết kiệm" (giá sale)
  const discountAmount = checkoutInfo.discountAmount ?? 0;

  return (
    <aside
      data-testid="success-summary"
      className="w-full shrink-0 rounded-xl border border-white-200 bg-white p-6 pb-4 shadow-card lg:sticky lg:top-24 lg:w-[400px]"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-base font-bold">
          Đơn hàng
          <span className="ml-2 text-sm font-medium text-dark-400">
            · {totalQuantity} sản phẩm
          </span>
        </h2>
        {headerAction}
      </div>

      <div className="flex flex-col">
        {products.map((item) => (
          <SummaryItem key={item.variantId} item={item} />
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-2.5 border-t border-white-500 pt-3.5 text-sm text-dark-500">
        <div className="flex justify-between">
          <span>{`Tạm tính (${totalQuantity} sản phẩm)`}</span>
          <span className="font-semibold text-dark-800">
            {formatPrice(subtotal + savings)}
          </span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between">
            <span>Tiết kiệm</span>
            <span className="font-semibold text-terracotta">
              −{formatPrice(savings)}
            </span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between gap-2">
            <span>{formatCouponDiscountLabel(checkoutInfo)}</span>
            <span className="font-semibold text-terracotta">
              −{formatPrice(discountAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Vận chuyển</span>
          <span className="font-semibold text-dark-800">
            {shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between border-t border-white-500 pt-3.5">
        <span className="text-sm font-semibold">Tổng cộng</span>
        <span className="text-2xl font-extrabold" data-testid="success-total">
          {formatPrice(checkoutInfo.totalPrice)}
        </span>
      </div>

      {children && <div className="mt-5">{children}</div>}
    </aside>
  );
}

function SummaryItem({ item }: { item: IOrderProduct }) {
  const attributeLabel = (item.attributeValuesAtOrder ?? [])
    .map((av) => (/^\d+$/.test(av.value) ? `${av.name} ${av.value}` : av.value))
    .filter(Boolean)
    .join(" · ");
  const lineTotal = item.priceAtOrder * item.quantity;

  const thumb = (
    <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-white-100">
      {item.variantImageAtOrder && (
        <Image
          src={item.variantImageAtOrder}
          alt={item.productNameAtOrder ?? ""}
          width={64}
          height={64}
          className="h-full w-full object-cover mix-blend-multiply"
        />
      )}
    </div>
  );
  const name = (
    <p className="line-clamp-2 text-sm font-semibold">
      {item.productNameAtOrder}
    </p>
  );
  // Đơn cũ không có snapshot slug → giữ nguyên dạng text, không dựng link chết
  const href = item.productSlugAtOrder
    ? `${PATH.PRODUCT}/${item.productSlugAtOrder}`
    : null;

  return (
    <div className="flex items-center gap-3 border-b border-white-300 py-2.5 last:border-b-0">
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Xem ${item.productNameAtOrder}`}
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
        >
          {thumb}
        </Link>
      ) : (
        thumb
      )}
      <div className="min-w-0 flex-1">
        {href ? (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded transition-colors hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
          >
            {name}
          </Link>
        ) : (
          name
        )}
        <p className="mt-0.5 text-xs text-dark-500">
          {[attributeLabel, `×${item.quantity}`].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="whitespace-nowrap text-right text-sm font-bold">
        {formatPrice(lineTotal)}
        {item.quantity > 1 && (
          <span className="block text-xs font-normal text-dark-400">
            {formatPrice(item.priceAtOrder)} × {item.quantity}
          </span>
        )}
      </div>
    </div>
  );
}
