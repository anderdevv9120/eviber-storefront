"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProgressStepper from "@/components/ui/ProgressStepper";
import CountdownTimer from "@/components/ui/CountdownTimer";

const LayoutCheckout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/cart") {
      setCurrentStep(1);
    } else if (pathname === "/checkout") {
      setCurrentStep(2);
    } else if (pathname === "/payment-success") {
      setCurrentStep(3);
    }
  }, [pathname]);

  return (
    <div className="w-full">
      <div className="container-base">
        <div className="w-full pb-12 pt-16 sm:px-20 px-0">
          <ProgressStepper
            currentStep={Number(currentStep)}
            stepItems={[
              { title: "Giỏ hàng", stepNumber: 1 },
              { title: "Thanh toán", stepNumber: 2 },
              { title: "Hoàn thành", stepNumber: 3 },
            ]}
          />
        </div>

        {currentStep == 2 && (
          <p className="pb-11 text-xl font-medium text-center">
            Đơn hàng của bạn sẽ được đặt trong
            <CountdownTimer countdownMinutes={10} redirectTo="/cart" />
            phút nữa
          </p>
        )}

        <div className="pb-12">{children}</div>
      </div>
    </div>
  );
};

export default LayoutCheckout;
