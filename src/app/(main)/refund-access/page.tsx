import { Metadata } from "next";
import { fetchStoreSettingsCached } from "@/apis/home.server";
import GuestRefundAccess from "@/components/refunds/GuestRefundAccess";

// Trang riêng tư theo đơn: không index, không theo link
export const metadata: Metadata = {
  title: "Yêu cầu hoàn tiền",
  robots: { index: false, follow: false },
};

export default async function RefundAccessPage() {
  const { emailAvailable, contact } = await fetchStoreSettingsCached();
  return (
    <div className="container-base container-narrow py-10 md:py-12">
      <GuestRefundAccess emailAvailable={emailAvailable} contact={contact} />
    </div>
  );
}
