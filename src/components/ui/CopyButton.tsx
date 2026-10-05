"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, LinkChain } from "@/components/icons";
import { cn } from "@/config/utils";

interface CopyButtonProps {
  value: string;
  label: string;
  copiedLabel: string;
  icon?: "copy" | "link";
  className?: string;
  testId?: string;
}

export default function CopyButton({
  value,
  label,
  copiedLabel,
  icon = "copy",
  className,
  testId,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard API bị chặn (http không phải localhost, quyền bị từ chối) — không có
      // đường dự phòng đáng tin, nên im lặng bỏ qua thay vì hiện toast lỗi khó hành động
      return;
    }
    setIsCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsCopied(false), 2000);
  };

  const Icon = icon === "link" ? LinkChain : Copy;

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2",
        className
      )}
    >
      {isCopied ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      {isCopied ? copiedLabel : label}
    </button>
  );
}
