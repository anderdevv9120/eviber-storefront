import { Metadata } from "next";
import CheckoutView from "./_component/CheckoutView";

// Trang phễu: noindex qua meta (đã bỏ /checkout khỏi robots Disallow để bot thấy được meta)
export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
