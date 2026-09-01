import { ComponentType } from "react";
import { Truck, Repeat, Shield, CheckOutline } from "@/components/icons";

const USP_ITEMS: {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}[] = [
  {
    Icon: Truck,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 499K",
  },
  {
    Icon: Repeat,
    title: "Đổi trả miễn phí",
    description: "Trong vòng 7 ngày",
  },
  {
    Icon: Shield,
    title: "Chất lượng đảm bảo",
    description: "Bảo hành đến 730 ngày",
  },
  {
    Icon: CheckOutline,
    title: "Thanh toán an toàn",
    description: "Nhiều phương thức linh hoạt",
  },
];

const UspStrip = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {USP_ITEMS.map(({ Icon, title, description }) => (
        <div
          key={title}
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
      ))}
    </div>
  );
};

export default UspStrip;
