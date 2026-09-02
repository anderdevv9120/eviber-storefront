import { Metadata } from "next";
import CartView from "./_component/CartView";

// Trang phễu: noindex qua meta (đã bỏ /cart khỏi robots Disallow để bot thấy được meta)
export const metadata: Metadata = {
  title: "Giỏ hàng",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
