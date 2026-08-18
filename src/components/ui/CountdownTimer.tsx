"use client";

import { cn } from "@/config/utils";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/utils/localStorage";
import { memo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CountdownTimerProps {
  countdownMinutes: number;
  className?: string;
  redirectTo?: string;
}

const CountdownTimer = ({
  countdownMinutes,
  className,
  redirectTo,
}: CountdownTimerProps) => {
  const router = useRouter();
  // Key theo ngữ cảnh để nhiều CountdownTimer không ghi đè lẫn nhau
  const storageKey = `countdownTimer:${redirectTo ?? "default"}`;

  // Khởi tạo theo prop; đọc localStorage trong effect để tránh hydration mismatch
  const [timeLeft, setTimeLeft] = useState(() => countdownMinutes * 60);
  // Chốt điều hướng chỉ chạy 1 lần dù effect re-run lúc timeLeft=0
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const stored = getLocalStorage(storageKey);
    const parsed = stored != null ? Number(stored) : NaN;
    if (Number.isFinite(parsed) && parsed >= 0) {
      setTimeLeft(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Đếm ngược mỗi giây, tự dừng khi về 0 (không side-effect trong updater)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Side-effect (localStorage/điều hướng) đặt đúng chỗ theo timeLeft
  useEffect(() => {
    if (timeLeft <= 0) {
      removeLocalStorage(storageKey);
      if (redirectTo && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.push(redirectTo);
      }
      return;
    }
    setLocalStorage(storageKey, timeLeft);
  }, [timeLeft, redirectTo, router, storageKey]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <span
      className={cn(
        "font-bold text-primary-600 mx-1 block sm:inline",
        className
      )}
    >
      {minutes} : {seconds}
    </span>
  );
};

export default memo(CountdownTimer);
