"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { Search } from "@/components/icons";
import Tabs from "@/components/ui/Tabs";
import useDebounce from "@/hooks/useDebounce";
import OrderList from "./_component/OrderList";

const tabData = (searchTerm: string) => [
  {
    key: "1",
    label: "Tất cả",
    children: <OrderList search={searchTerm} />,
  },
  {
    key: "2",
    label: "Chờ thanh toán",
    children: <OrderList status="pending" search={searchTerm} />,
  },
  {
    key: "3",
    label: "Vận chuyển",
    children: <OrderList status="shipped" search={searchTerm} />,
  },
  {
    key: "4",
    label: "Hoàn thành",
    children: <OrderList status="confirmed" search={searchTerm} />,
  },
  {
    key: "5",
    label: "Đã hủy",
    children: <OrderList status="cancelled" search={searchTerm} />,
  },
];

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState<BaseValueType>(tabData("")[0].key);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  return (
    <div className="shadow-lg border-t border-primary rounded-lg">
      <div className="p-4 flex justify-between items-center gap-6">
        <h1 className="text-primary text-xl font-medium whitespace-nowrap">
          Lịch sử đơn hàng
        </h1>

        <div className="w-full truncate">
          <Input
            type="text"
            placeholder="Tìm kiếm đơn hàng"
            icon={<Search className="text-primary w-7 h-7 cursor-pointer" />}
            variant={"outlined"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        tabItems={tabData(debouncedSearchTerm)}
        onChange={setActiveTab}
        activeKey={activeTab}
        className="w-full"
      />
    </div>
  );
}
