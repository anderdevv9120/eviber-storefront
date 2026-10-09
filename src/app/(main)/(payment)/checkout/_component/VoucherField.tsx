import type { AppliedCoupon } from "@/@types/Order.type";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";
import { errorToast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { cn } from "@/config/utils";

export interface VoucherFieldProps {
  signedIn: boolean;
  draftCode: string;
  busy: boolean;
  /** Draft differs from the reviewed code: info hint, not an error. */
  pending?: boolean;
  error?: string;
  appliedCoupon?: AppliedCoupon;
  onCodeChange(value: string): void;
  onApply(): Promise<void>;
  onRemove(): Promise<void>;
}

export default function VoucherField({
  signedIn,
  draftCode,
  busy,
  pending,
  error,
  appliedCoupon,
  onCodeChange,
  onApply,
  onRemove,
}: VoucherFieldProps) {
  if (!signedIn) {
    return (
      <div className="py-5 text-sm">
        <p>
          <Link
            href={PATH.LOGIN}
            className="font-semibold text-primary-700 underline"
          >
            Đăng nhập để sử dụng mã giảm giá
          </Link>
        </p>
        <p
          role="status"
          aria-live="polite"
          className={cn("mt-2", error && "text-red-600")}
        >
          {error}
        </p>
      </div>
    );
  }
  const reportError = (cause: unknown) => errorToast(getErrorMessage(cause));
  return (
    <section className="py-6 border-b border-white-500" aria-busy={busy}>
      <label
        htmlFor="checkout-voucher"
        className="block text-sm font-semibold mb-2"
      >
        Mã giảm giá
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="checkout-voucher"
          name="couponCode"
          value={draftCode}
          onChange={(event) => onCodeChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (!busy && draftCode.trim()) onApply().catch(reportError);
            }
          }}
          maxLength={100}
          autoComplete="off"
          aria-describedby="checkout-voucher-feedback"
          aria-invalid={!!error}
          className="min-w-0 flex-1 px-3 py-2 border border-dark-200 rounded-lg focus-visible:outline-primary-500"
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy || !draftCode.trim()}
          onClick={() => onApply().catch(reportError)}
        >
          Áp dụng
        </Button>
        {(draftCode || appliedCoupon || error || pending) && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onRemove().catch(reportError)}
          >
            Gỡ mã
          </Button>
        )}
      </div>
      <p
        id="checkout-voucher-feedback"
        role="status"
        aria-live="polite"
        className={cn("mt-2 text-sm", error && "text-red-600")}
      >
        {error ||
          (busy
            ? "Đang kiểm tra mã giảm giá..."
            : pending
              ? "Áp dụng mã mới hoặc gỡ mã trước khi đặt hàng."
              : appliedCoupon
                ? `Đã áp dụng mã ${appliedCoupon.couponCode}`
                : "")}
      </p>
    </section>
  );
}
