import { Metadata } from "next";
import PaymentSuccessView from "./_component/PaymentSuccessView";

// Trang phễu: noindex qua meta (đã bỏ /payment-success khỏi robots Disallow để bot thấy được meta)
export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  robots: { index: false, follow: true },
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessView />;
}
