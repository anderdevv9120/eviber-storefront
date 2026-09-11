"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { Search } from "@/components/icons";
import { cn } from "@/config/utils";
import { ORDER_TABS } from "@/constants/orderStatus";
import useDebounce from "@/hooks/useDebounce";
import OrderList from "./_component/OrderList";

const OrderManagement = () => {
  const [activeKey, setActiveKey] = useState(ORDER_TABS[0].key);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const activeTab =
    ORDER_TABS.find((tab) => tab.key === activeKey) ?? ORDER_TABS[0];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Đơn hàng của tôi</h1>
        <div className="sm:w-[300px]">
          <Input
            type="text"
            placeholder="Nhập tên sản phẩm hoặc mã đơn"
            aria-label="Nhập tên sản phẩm hoặc mã đơn"
            icon={<Search className="h-[18px] w-[18px] text-dark-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 py-0 text-base"
          />
        </div>
      </div>

      {/* Tab dạng chip: 5 mục nên xuống dòng gọn hơn cuộn ngang ở màn hẹp */}
      <div
        aria-label="Lọc đơn theo trạng thái"
        className="mb-4 flex flex-wrap gap-2"
      >
        {ORDER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={tab.key === activeKey}
            onClick={() => setActiveKey(tab.key)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2",
              tab.key === activeKey
                ? "border-primary bg-primary font-semibold text-white"
                : "border-white-600 bg-white text-dark-500 hover:border-primary-300 hover:text-primary-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <OrderList status={activeTab.status} search={debouncedSearchTerm} />
    </div>
  );
};

export default OrderManagement;
