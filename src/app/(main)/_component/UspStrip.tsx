import { Truck, Repeat, Shield, CheckOutline } from "@/components/icons";
import type { IHomePromise } from "@/@types/StoreContent.type";

// Icon cố định theo vị trí — CMS chỉ sửa chữ (spec content management)
const USP_ICONS = [Truck, Repeat, Shield, CheckOutline];

const UspStrip = ({ items }: { items: IHomePromise[] }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ title, description }, index) => {
        const Icon = USP_ICONS[index] ?? CheckOutline;
        return (
          <div
            key={index}
            // Mobile: icon trên - text dưới căn giữa (card ~170px); md trở lên: icon trái text phải
            className="flex flex-col items-center text-center gap-2 md:flex-row md:text-left md:gap-4 rounded-xl bg-white border border-primary-100 p-4 shadow-sm"
          >
            <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700">
              <Icon className="w-6 h-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-dark-800">{title}</p>
              <p className="text-xs text-dark-500 mt-0.5">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UspStrip;
