import { Truck, Repeat, Shield, CheckOutline } from "@/components/icons";
import type { IHomePromise } from "@/@types/StoreContent.type";

// Icon cố định theo vị trí — CMS chỉ sửa chữ (spec content management)
const USP_ICONS = [Truck, Repeat, Shield, CheckOutline];

const UspStrip = ({ items }: { items: IHomePromise[] }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 border-y border-white-300 py-6 md:py-8">
      {items.map(({ title, description }, index) => {
        const Icon = USP_ICONS[index] ?? CheckOutline;
        return (
          <div key={index} className="flex items-start gap-4 md:items-center">
            <Icon className="w-6 h-6 shrink-0 text-primary-700" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-dark-800 text-balance">
                {title}
              </p>
              <p className="text-xs text-dark-500 mt-0.5 text-balance">
                {description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UspStrip;
