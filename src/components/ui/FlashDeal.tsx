"use client";

import { Fragment, memo } from "react";
import { useState, useEffect } from "react";
import { calculateTimeLeft } from "@/utils/formatTime";
import { Thunder } from "@/components/icons";

interface FlashDealProps {
  endTime: Date;
}

const FlashDeal = ({ endTime }: FlashDealProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex justify-between items-center h-11 mb-6 px-2 text-white rounded-lg bg-gradient-to-r from-[#E01020] to-[#471578]">
      <div className="flex">
        <Thunder />
        <p className="ml-2 my-auto font-semibold italic">FLASH DEAL</p>
      </div>
      <div className="flex items-center">
        <p className="text-sm font-thin mr-2">Kết thúc trong</p>
        <div className="flex items-center">
          {timeLeft.map((time, index) => (
            <Fragment key={index}>
              <p className="w-5 h-4 text-xs text-center mx-1 rounded bg-primary-300">
                {time}
              </p>
              {index < timeLeft.length - 1 && (
                <span className="text-center mb-0.5">:</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(FlashDeal);
