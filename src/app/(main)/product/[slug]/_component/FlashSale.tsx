"use client";

import { useEffect, useState } from "react";
import SvgIcon from "@/components/ui/SvgIcon";

// Deal theo NGÀY: đếm ngược tới 23:59:59 hôm nay, hiển thị khi variant đang giảm giá
// thật. Strip mảnh 1 dòng — giá nằm ngoài ở price row (chốt vòng /ui-audit GĐ1).
const getSecondsLeftToday = () => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));
};

const pad = (value: number) => String(value).padStart(2, "0");

const FlashSale = () => {
  // null tới khi mounted — countdown tính theo giờ client, render server sẽ lệch hydration
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    setSecondsLeft(getSecondsLeftToday());
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsLeftToday());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours =
    secondsLeft != null ? pad(Math.floor(secondsLeft / 3600)) : "--";
  const minutes =
    secondsLeft != null ? pad(Math.floor((secondsLeft % 3600) / 60)) : "--";
  const seconds = secondsLeft != null ? pad(secondsLeft % 60) : "--";

  return (
    // Strip full bề ngang cột content (F2): label trái — microcopy giữa lấp khoảng
    // trống (ẩn khi cột hẹp) — đồng hồ 3 Ô SỐ to bên phải (chỉnh vòng duyệt spacing).
    // flex-wrap BẮT BUỘC: 2 cụm đều nowrap, thiếu wrap là min-content banh rộng cột
    // ở mobile 390 → title bị xén, ảnh phình (bug /ui-audit header)
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 rounded-lg border border-terracotta/20 bg-terracotta/10 text-ink">
      {/* Mobile rút "hôm nay" + "Kết thúc trong" để strip gọn 1 hàng (chốt F1 mobile-refine) */}
      <span className="flex items-center gap-2 text-sm font-bold whitespace-nowrap uppercase">
        <SvgIcon name="thunder-outline" className="w-4 h-4 shrink-0" />
        Flash sale<span className="hidden sm:inline"> hôm nay</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
          Kết thúc trong
        </span>
        <CountdownCell value={hours} />
        <span className="font-bold">:</span>
        <CountdownCell value={minutes} />
        <span className="font-bold">:</span>
        <CountdownCell value={seconds} />
      </span>
    </div>
  );
};

const CountdownCell = ({ value }: { value: string }) => (
  <span className="flex items-center justify-center min-w-[28px] sm:min-w-[32px] px-1 py-0.5 rounded-md bg-terracotta/15 text-sm sm:text-base font-bold tabular-nums">
    {value}
  </span>
);

export default FlashSale;
