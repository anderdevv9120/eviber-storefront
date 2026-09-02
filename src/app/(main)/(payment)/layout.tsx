"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ProgressStepper from "@/components/ui/ProgressStepper";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { PATH } from "@/constants/paths";

const STEP_BY_PATH: Record<string, number> = {
  [PATH.CART]: 1,
  [PATH.CHECKOUT]: 2,
  [PATH.PAYMENT_SUCCESS]: 3,
};

const LayoutCheckout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const pathname = usePathname();
  const currentStep = STEP_BY_PATH[pathname] ?? 1;

  return (
    <div className="container-base">
      <div className="pt-10 md:pt-12 pb-8">
        <ProgressStepper
          currentStep={currentStep}
          stepItems={[
            { title: "Giỏ hàng", stepNumber: 1 },
            { title: "Thanh toán", stepNumber: 2 },
            { title: "Hoàn thành", stepNumber: 3 },
          ]}
        />
      </div>

      {currentStep === 2 && (
        <p className="pb-8 font-medium text-center">
          Đơn hàng của bạn sẽ được đặt trong
          <CountdownTimer countdownMinutes={10} redirectTo={PATH.CART} />
          phút nữa
        </p>
      )}

      <div className="pb-12 md:pb-16">{children}</div>
    </div>
  );
};

export default LayoutCheckout;
