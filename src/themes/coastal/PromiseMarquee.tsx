"use client";

import { useState } from "react";
import { cn } from "@/config/utils";
import type { IHomePromise } from "@/@types/StoreContent.type";

// Dải cam kết chạy ngang. Mỗi nửa track = danh sách ×2 (đủ dài hơn viewport rộng), track = 2 nửa
// giống hệt → animate-marquee (-50%) lặp liền mạch. Chỉ bản đầu tiên cho screen reader đọc.
// Dừng được bằng hover (chuột) và nút dừng/chạy (bàn phím, cảm ứng — WCAG 2.2.2).
// Reduced motion: đứng yên, chỉ còn bản đầu, xuống dòng thay vì bị cắt; nút ẩn vì không có gì chạy
export default function PromiseMarquee({ items }: { items: IHomePromise[] }) {
  const [paused, setPaused] = useState(false);
  const half = [...items, ...items];

  return (
    <section
      aria-label="Cam kết của cửa hàng"
      className="mt-6 md:mt-8 flex items-center border-y border-white-300"
    >
      <button
        type="button"
        aria-label={paused ? "Tiếp tục chạy" : "Tạm dừng"}
        onClick={() => setPaused((value) => !value)}
        className="motion-reduce:hidden grid place-items-center size-11 shrink-0 ml-[calc(var(--container-px)-6px)] rounded-full text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          {paused ? (
            <path d="M4 2.5v11l9-5.5z" />
          ) : (
            <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
          )}
        </svg>
      </button>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className="flex w-max motion-safe:animate-marquee motion-safe:hover:[animation-play-state:paused] motion-reduce:w-auto"
          // Inline thắng class: đang dừng thì rê chuột ra cũng không chạy lại
          style={paused ? { animationPlayState: "paused" } : undefined}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className={cn(
                "flex shrink-0 motion-reduce:shrink motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center",
                copy === 1 && "motion-reduce:hidden"
              )}
            >
              {half.map((item, index) => {
                const repeat = index >= items.length;
                return (
                  <li
                    key={index}
                    aria-hidden={(copy === 0 && repeat) || undefined}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 text-sm font-semibold text-dark-500 whitespace-nowrap",
                      repeat && "motion-reduce:hidden"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full bg-[rgb(var(--theme-sun))]"
                    />
                    {item.title}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
