import { Controller, useFormContext } from "react-hook-form";
import FormError from "@/components/ui/FormError";
import { formatPrice } from "@/utils/formatPrice";
import { CHECKOUT_PAYMENT_METHODS } from "@/constants/payment";
import ChoiceCard from "./ChoiceCard";

interface PaymentMethodFieldProps {
  totalPrice: number;
}

export default function PaymentMethodField({
  totalPrice,
}: PaymentMethodFieldProps) {
  const { control } = useFormContext();

  return (
    <div>
      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            {CHECKOUT_PAYMENT_METHODS.map((method) => (
              <ChoiceCard
                key={method.value}
                name="paymentMethod"
                value={method.value}
                checked={field.value === method.value}
                onSelect={field.onChange}
                title={method.label}
                description={method.description}
                testId={`payment-${method.value}`}
              >
                {method.value === "BANK_TRANSFER" && (
                  <div
                    data-testid="qr-slot"
                    className="flex items-center gap-2.5 p-3 bg-white border border-dashed border-primary-200 rounded-lg text-sm text-dark-500"
                  >
                    <span
                      aria-hidden
                      className="w-10 h-10 shrink-0 rounded-md bg-white-200"
                    />
                    <span>
                      Số tài khoản và mã QR cho đúng số tiền{" "}
                      <b className="text-dark-800">{formatPrice(totalPrice)}</b>{" "}
                      hiển thị ngay sau khi đặt hàng.
                    </span>
                  </div>
                )}
              </ChoiceCard>
            ))}
          </div>
        )}
      />
      <FormError name="paymentMethod" />
    </div>
  );
}
