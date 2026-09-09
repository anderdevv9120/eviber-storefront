import { cn } from "@/config/utils";
import { formatPrice } from "@/utils/formatPrice";
import {
  BANK_TRANSFER_ACCOUNT,
  PAYMENT_METHOD_LABEL,
  PaymentMethod,
} from "@/constants/payment";

interface PaymentActionCardProps {
  method?: string;
  totalPrice: number;
  orderNumber: string;
}

/**
 * Nhóm "Thanh toán" bên trong thẻ thông tin đơn. Chuyển khoản là việc khách còn phải
 * làm nên mở đủ thông tin + slot QR, và nhận nền Pine tràn mép thẻ để khối cao đó có
 * chỗ neo giữa các nhóm hairline; COD chỉ cần một dòng nên để trần như nhóm thường.
 */
export default function PaymentActionCard({
  method,
  totalPrice,
  orderNumber,
}: PaymentActionCardProps) {
  if (method === "BANK_TRANSFER") {
    return (
      <section
        data-testid="bank-transfer-guide"
        className="-mx-6 border-b border-white-500 bg-primary-50 px-6 py-5"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-primary-700">
          Thanh toán
        </p>
        <p className="mt-1 font-bold text-primary-800">
          Chuyển khoản để hoàn tất
        </p>
        <p className="mb-4 mt-1 text-sm text-dark-500">
          Đơn được xác nhận ngay khi tiền về tài khoản. Giữ đúng nội dung chuyển
          khoản để đối soát tự động.
        </p>

        <div className="flex flex-wrap items-start gap-4">
          <dl className="flex min-w-[240px] flex-1 flex-col gap-2.5 text-sm">
            <BankRow label="Ngân hàng" value={BANK_TRANSFER_ACCOUNT.bankName} />
            <BankRow
              label="Số tài khoản"
              value={BANK_TRANSFER_ACCOUNT.accountNumber}
              isTabular
            />
            <BankRow
              label="Chủ tài khoản"
              value={BANK_TRANSFER_ACCOUNT.accountName}
            />
            <BankRow label="Số tiền" value={formatPrice(totalPrice)} />
            <BankRow label="Nội dung" value={orderNumber} isTabular />
          </dl>

          <div
            data-testid="qr-slot"
            className="grid h-[132px] w-[132px] shrink-0 place-items-center rounded-lg border border-dashed border-primary-200 bg-white p-2.5 text-center text-xs leading-snug text-dark-400"
          >
            Mã QR chuyển khoản sẽ hiển thị ở đây
          </div>
        </div>
      </section>
    );
  }

  // Enum BE có 4 giá trị (CASH/CARD/BANK_TRANSFER/E_WALLET) — chỉ COD mới có việc
  // chuẩn bị tiền mặt, phương thức khác chỉ nêu tên để không nói sai với khách
  const methodLabel =
    method && method in PAYMENT_METHOD_LABEL
      ? PAYMENT_METHOD_LABEL[method as PaymentMethod]
      : (method ?? "—");

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

function BankRow({
  label,
  value,
  isTabular,
}: {
  label: string;
  value: string;
  isTabular?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-dark-500">{label}</dt>
      <dd
        className={cn(
          "m-0 text-right font-bold",
          isTabular && "tabular-nums tracking-wide"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
