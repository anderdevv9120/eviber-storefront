import { useEffect, useState, type FocusEvent } from "react";
import useCustomSwipeable from "@/hooks/useCustomSwipeable";
import { stepIndex } from "@/hooks/bannerStep";

export const AUTO_SLIDE_MS = 5000;

export const useBannerCycle = (count: number) => {
  const [current, setCurrent] = useState(0);
  // Focus trong hero (CTA/dot) → dừng tự chuyển: slide cũ thành inert sẽ cướp focus bàn phím
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count <= 1 || paused) return;
    // ponytail: đọc reduced-motion mỗi lần đổi slide, không lắng nghe "change" — đổi setting giữa chừng có hiệu lực từ slide sau
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setCurrent((prev) => stepIndex(prev, count, 1));
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [count, current, paused]);

  const swipeHandlers = useCustomSwipeable({
    onSwipedLeft: () => setCurrent((prev) => stepIndex(prev, count, 1)),
    onSwipedRight: () => setCurrent((prev) => stepIndex(prev, count, -1)),
  });

  const focusHandlers = {
    onFocus: () => setPaused(true),
    onBlur: (e: FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
    },
  };

  return { current, setCurrent, count, focusHandlers, swipeHandlers };
};
