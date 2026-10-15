import { Controller, useFormContext } from "react-hook-form";
import FormError from "@/components/ui/FormError";
import { formatPrice } from "@/utils/formatPrice";
import { CHECKOUT_PAYMENT_METHODS } from "@/constants/payment";
import ChoiceCard from "./ChoiceCard";
import QrPreview from "./QrPreview";

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
                    className="flex items-center gap-4 p-3 bg-white border border-primary-200 rounded-lg text-sm text-dark-500"
                  >
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-primary-100 bg-white">
                      <QrPreview className="h-[60px] w-[60px]" />
                    </span>
                    <p>
                      <b className="font-semibold text-dark-800">
                        Mã QR và số tài khoản cho đúng {formatPrice(totalPrice)}
                      </b>{" "}
                      hiện ngay sau khi bạn đặt hàng. Quét bằng app ngân hàng,
                      đơn tự xác nhận khi tiền về.
                    </p>
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
