import { formatPrice } from "@/utils/formatPrice";
import { PAYMENT_METHOD_LABEL, OrderPaymentMethod } from "@/constants/payment";
import { BankTransferState } from "@/utils/bankTransfer";
import BankTransferPanel from "@/components/ui/BankTransferPanel";

interface PaymentActionCardProps {
  method?: OrderPaymentMethod;
  totalPrice: number;
  orderNumber: string;
  bankState: BankTransferState | null;
  now: Date;
  paymentDueAt?: string;
  paidAt?: string;
  paymentStatus?: string;
}

/**
 * Nhóm "Thanh toán" bên trong thẻ thông tin đơn. Chuyển khoản đang chờ là việc khách còn phải
 * làm nên nhận nền Pine tràn mép thẻ để khối cao đó có chỗ neo giữa các nhóm hairline;
 * đã trả / hết hạn / COD chỉ cần một dòng nên để trần như nhóm thường.
 */
export default function PaymentActionCard({
  method,
  totalPrice,
  orderNumber,
  bankState,
  now,
  paymentDueAt,
  paidAt,
  paymentStatus,
}: PaymentActionCardProps) {
  if (bankState) {
    const isAwaiting = bankState === "awaiting";
    return (
      <section
        className={
          isAwaiting
            ? "-mx-6 border-b border-white-500 bg-primary-50 px-6 py-5"
            : "border-b border-white-500 py-5"
        }
      >
        <BankTransferPanel
          state={bankState}
          orderNumber={orderNumber}
          totalPrice={totalPrice}
          now={now}
          paymentDueAt={paymentDueAt}
          paidAt={paidAt}
          paymentStatus={paymentStatus}
        />
      </section>
    );
  }

  // Enum BE có 5 giá trị (CASH/CARD/BANK_TRANSFER/E_WALLET/NO_PAYMENT) — chỉ COD mới có việc
  // chuẩn bị tiền mặt, phương thức khác (kể cả đơn 0đ không cần thanh toán) chỉ nêu tên
  const methodLabel = method ? (PAYMENT_METHOD_LABEL[method] ?? method) : "—";

  return (
    <section
      data-testid="payment-method"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-white-500 py-5"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-dark-400">
          Thanh toán
        </p>
        <p className="mt-1 font-semibold">{methodLabel}</p>
      </div>
      {method === "CASH" && (
        <p className="text-sm text-dark-500">
          Chuẩn bị{" "}
          <b className="font-bold text-dark-800">{formatPrice(totalPrice)}</b>{" "}
          tiền mặt
        </p>
      )}
    </section>
  );
}
