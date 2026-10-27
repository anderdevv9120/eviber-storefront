import type { IStoreSettings } from "@/@types/StoreContent.type";
import { cn } from "@/config/utils";

interface ContactShopLinksProps {
  contact: IStoreSettings["contact"];
  className?: string;
}

const LINK_CLASS =
  "rounded font-semibold text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100";

// Thay cho thao tác cần gửi mail khi shop chưa bật gửi email (quên mật khẩu, link hoàn tiền guest)
export default function ContactShopLinks({
  contact,
  className,
}: ContactShopLinksProps) {
  const phone = contact.phone.trim();
  const email = contact.email.trim();

  return (
    <ul className={cn("space-y-1 text-sm text-dark-700", className)}>
      {email && (
        <li>
          Email:{" "}
          <a href={`mailto:${email}`} className={LINK_CLASS}>
            {email}
          </a>
        </li>
      )}
      {phone && (
        <li>
          Hotline:{" "}
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className={LINK_CLASS}>
            {phone}
          </a>
        </li>
      )}
    </ul>
  );
}
