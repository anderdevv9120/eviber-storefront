"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useCustomSwipeable from "@/hooks/useCustomSwipeable";
import { cn } from "@/config/utils";
import type { ThemeHeroProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

const AUTO_SLIDE_MS = 5000;

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const Hero = ({ banners }: ThemeHeroProps) => {
  const [current, setCurrent] = useState(0);
  // Focus trong hero (CTA/dot) → dừng tự chuyển: slide cũ thành inert sẽ cướp focus bàn phím
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    // ponytail: đọc reduced-motion mỗi lần đổi slide, không lắng nghe "change" — đổi setting giữa chừng có hiệu lực từ slide sau
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [count, current, paused]);

  // Hook phải gọi trước early-return (rules of hooks)
  const swipeHandlers = useCustomSwipeable({
    onSwipedLeft: () => setCurrent((prev) => (prev + 1) % count),
    onSwipedRight: () =>
      setCurrent((prev) => (prev === 0 ? count - 1 : prev - 1)),
  });

  if (count === 0) return null;

  return (
    <section
      aria-label="Banner khuyến mãi"
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      className="max-w-[1440px] mx-auto px-[clamp(16px,4vw,48px)] pt-4 grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(32px,5vw,72px)]"
    >
      {/* Các slide chữ chồng cùng ô grid → cột cao theo slide dài nhất, đổi slide không nhảy layout.
          min-w-0 + grid-cols-1 (minmax(0,1fr)) để break-words có tác dụng — track auto co theo min-content của từ dài */}
      <div className="grid grid-cols-1 min-w-0">
        {banners.map((banner, index) => {
          const active = index === current;
          return (
            <div
              key={banner._id}
              className={cn(
                "[grid-area:1/1] transition-opacity duration-700",
                active ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-hidden={!active}
              inert={!active}
            >
              {/* leading 1 thay 0.88 của mockup: dấu chồng tiếng Việt (ể, ấ) đè chân chữ g/p dòng trên */}
              <h2 className="font-display text-dark-800 leading-none tracking-[-0.02em] text-[clamp(64px,9vw,152px)] break-words">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="mt-7 text-lg leading-relaxed text-dark-500 max-w-[440px]">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link
                  href={banner.ctaHref}
                  className={cn(
                    "mt-9 inline-flex items-center gap-2.5 min-h-[56px] px-8 rounded-full bg-primary-600 hover:bg-primary-800 text-white font-semibold transition-colors",
                    FOCUS_RING
                  )}
                >
                  {banner.ctaLabel}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center">
        <div
          {...swipeHandlers}
          className="relative w-full max-w-[600px] aspect-[4/5] rounded-[999px_999px_32px_32px] overflow-hidden bg-primary-200"
        >
          {banners.map((banner, index) => (
            <Image
              key={banner._id}
              src={resolveImageUrl(banner.image)}
              alt={banner.title}
              fill
              priority={index === 0}
              // Kéo chuột trên <img> mở native drag, nuốt mousemove → swipe chuột không chạy
              draggable={false}
              sizes="(min-width: 768px) 50vw, 100vw"
              aria-hidden={index !== current}
              className={cn(
                "object-cover transition-opacity duration-700",
                index === current ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>

        {count > 1 && (
          <div className="mt-5 flex gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner._id}
                type="button"
                aria-label={`Banner ${index + 1}`}
                aria-current={index === current}
                onClick={() => setCurrent(index)}
                className={cn(
                  // Hit-area dọc 40px; ngang chỉ nới nửa gap để các dot không đè vùng bấm của nhau
                  "relative h-2 rounded-full transition-all duration-300 after:absolute after:-inset-x-1 after:-inset-y-4 after:content-['']",
                  FOCUS_RING,
                  index === current
                    ? "w-5 bg-primary-600"
                    : "w-2 bg-dark-200 hover:bg-dark-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
