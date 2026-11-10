"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useCustomSwipeable from "@/hooks/useCustomSwipeable";
import { cn } from "@/config/utils";
import type { ThemeHeroProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import { heroCollageSides } from "./home/content";

const AUTO_SLIDE_MS = 5000;

// Cỡ tiêu đề theo độ dài (CMS cho tới 200 ký tự) và chặn theo chiều cao màn hình (vh)
// để chữ vừa khung hero; tiêu đề ngắn mới được cỡ lớn kiểu mockup (clamp 48–104px).
// leading ≥ 1.1: dấu chồng tiếng Việt (ể, ấ) không đè dòng trên.
// leading đứng SAU cỡ chữ: cn() (tailwind-merge) bỏ leading-* nằm trước text-[...]
const titleClass = (title: string) =>
  title.length <= 30
    ? "text-[clamp(48px,min(7vw,11vh),104px)] leading-[1.1]"
    : title.length <= 70
      ? "text-[clamp(36px,min(5vw,8vh),72px)] leading-[1.1]"
      : "text-[clamp(28px,min(3.2vw,5vh),48px)] leading-[1.15]";

// Nền ảnh tối → outline trắng thay ring màu nhấn
const FOCUS_RING =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

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
    // Mockup .hero: mỗi banner 1 collage 3 ảnh (.hero-imgs) nếu ảnh banner khớp map trong content.ts,
    // không thì 1 ảnh full-bleed (banner CMS); gradient tối, chữ canh giữa, dot dạng vạch
    <section
      aria-label="Banner khuyến mãi"
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      {...swipeHandlers}
      className="relative h-[min(86vh,820px)] min-h-[520px] overflow-hidden bg-dark-800 text-white"
    >
      {banners.map((banner, index) => {
        const sides = heroCollageSides(banner.image);
        const imageClass = "object-cover object-[center_25%]";
        return (
          <div
            key={banner._id}
            aria-hidden={index !== current}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === current ? "opacity-100" : "opacity-0"
            )}
          >
            {sides ? (
              // ≤860px (media query mockup) chỉ còn ảnh giữa; ảnh hai bên display:none + lazy → mobile không tải
              <div className="grid h-full grid-cols-1 gap-0.5 min-[861px]:grid-cols-3">
                {[sides[0], banner.image, sides[1]].map((src, col) => (
                  <div
                    key={col}
                    className={cn(
                      "relative",
                      col !== 1 && "hidden min-[861px]:block"
                    )}
                  >
                    <Image
                      src={resolveImageUrl(src)}
                      alt={col === 1 ? banner.title : ""}
                      fill
                      priority={index === 0 && col === 1}
                      draggable={false}
                      sizes="(min-width: 861px) 34vw, 100vw"
                      className={imageClass}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Kéo chuột trên <img> mở native drag, nuốt mousemove → swipe chuột không chạy (draggable={false})
              <Image
                src={resolveImageUrl(banner.image)}
                alt={banner.title}
                fill
                priority={index === 0}
                draggable={false}
                sizes="100vw"
                className={imageClass}
              />
            )}
          </div>
        );
      })}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/[.12] via-black/[.28] to-black/50"
      />

      {/* Các slide chữ chồng cùng ô grid → đổi slide không nhảy layout */}
      {/* text-shadow: ảnh CMS sáng (áo trắng) vẫn đọc được chữ trắng — gradient mockup không đủ */}
      <div className="absolute inset-0 grid grid-cols-1 place-items-center p-6 [text-shadow:0_1px_14px_rgb(0_0_0/0.35)]">
        {banners.map((banner, index) => {
          const active = index === current;
          return (
            <div
              key={banner._id}
              className={cn(
                "[grid-area:1/1] flex min-w-0 max-w-[900px] flex-col items-center text-center transition-opacity duration-700",
                active ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-hidden={!active}
              inert={!active}
            >
              <p className="text-xs font-semibold uppercase tracking-[.28em]">
                Bộ sưu tập Thu Đông 2026
              </p>
              <h2
                className={cn(
                  "mt-3.5 mb-2.5 font-display italic font-normal tracking-[-0.02em] break-words",
                  titleClass(banner.title)
                )}
              >
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="max-w-[560px] text-base opacity-90">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaLabel && banner.ctaHref && (
                <Link
                  href={banner.ctaHref}
                  className={cn(
                    "mt-7 inline-flex items-center gap-2.5 rounded-btn border-[1.5px] border-white px-[26px] py-[13px] text-[13px] font-semibold uppercase tracking-[.08em] transition-colors hover:bg-white hover:text-deep",
                    FOCUS_RING
                  )}
                >
                  {banner.ctaLabel}
                  <svg
                    width="16"
                    height="16"
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

      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner._id}
              type="button"
              aria-label={`Banner ${index + 1}`}
              aria-current={index === current}
              onClick={() => setCurrent(index)}
              className={cn(
                // Vạch 28×2px; hit-area dọc 40px, ngang nới đúng nửa gap-2 để không đè vùng bấm của nhau
                "relative h-0.5 w-7 transition-colors duration-300 after:absolute after:-inset-x-1 after:-inset-y-5 after:content-['']",
                FOCUS_RING,
                index === current ? "bg-white" : "bg-white/45 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
