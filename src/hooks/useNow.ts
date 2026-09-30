"use client";

import { useEffect, useState } from "react";

/** Mốc "bây giờ" tự làm mới theo chu kỳ — chip hạn / state hết hạn cùng một đồng hồ, không lệch pha */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
