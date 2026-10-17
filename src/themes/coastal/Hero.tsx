"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { useBannerCycle } from "@/hooks/useBannerCycle";
import { cn } from "@/config/utils";
import type { ThemeHeroProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Cỡ tiêu đề theo độ dài (CMS cho tới 200 ký tự) — tiêu đề ngắn mới được cỡ lớn.
// leading đứng SAU cỡ chữ: cn() (tailwind-merge) bỏ leading-* nằm trước text-[...]
const titleClass = (title: string) =>
  title.length <= 30
    ? "text-[clamp(36px,5vw,64px)] leading-[1.05]"
    : title.length <= 70
      ? "text-[clamp(30px,3.8vw,48px)] leading-[1.1]"
      : "text-[clamp(24px,2.6vw,34px)] leading-[1.15]";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";

const RISE = "motion-safe:animate-rise";

// Collage tối đa 3 ảnh banner trên ô xoay nghiêng. Xoay ở lớp ngoài, drift ở lớp trong:
// keyframe drift tự set transform nên sẽ ghi đè rotate nếu chung một phần tử.
// Thời lượng/delay inline: [animation-*] dạng class bị shorthand của animate-drift ghi đè
const TILES = [
  {
    position: "left-0 top-3 w-[60%] h-[70%] -rotate-[5deg]",
    duration: "7s",
    delay: "0s",
  },
  {
    position: "right-0 bottom-0 w-[52%] h-[58%] rotate-[6deg]",
    duration: "8.5s",
    delay: "0.8s",
  },
  {
    position: "right-[6%] top-0 w-[34%] h-[36%] rotate-[3deg]",
    duration: "10s",
    delay: "1.6s",
  },
];
// 1 banner → một ô lớn giữa khung thay vì ô lệch góc trơ trọi
const SINGLE_TILE = {
  position: "inset-x-[8%] inset-y-3 -rotate-[3deg]",
  duration: "7s",
  delay: "0s",
};

const Hero = ({ banners }: ThemeHeroProps) => {
  const { current, setCurrent, count, focusHandlers, swipeHandlers } =
    useBannerCycle(banners.length);

  if (count === 0) return null;

  const collage = banners.slice(0, TILES.length);

  return (
    <section
      aria-label="Banner khuyến mãi"
      {...focusHandlers}
      className="container-base pt-4 md:pt-6"
    >
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(180deg,rgb(var(--theme-sky))_0%,#E8F4F6_65%,rgb(var(--theme-sand))_100%)] p-6 sm:p-10 lg:p-14 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-10 lg:gap-14">
        {/* Mặt trời — thuần trang trí, nằm dưới collage */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-6 md:right-10 md:top-8 size-20 md:size-32 rounded-full bg-[rgb(var(--theme-sun))] opacity-90 shadow-[0_0_0_18px_rgb(var(--theme-sun)/0.25)]"
        />

        <div className="relative min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink pr-20 md:pr-0">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full bg-[rgb(var(--theme-coral))]"
            />
            {BRAND.tagline}
          </p>
          {/* Các slide chồng cùng ô grid → cột cao theo slide dài nhất, đổi slide không nhảy layout */}
          <div className="grid grid-cols-1 mt-4">
            {banners.map((banner, index) => {
              const active = index === current;
              return (
                <div
                  key={banner._id}
                  className={cn(
                    "[grid-area:1/1] min-w-0 transition-opacity duration-700",
                    active ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                  aria-hidden={!active}
                  inert={!active}
                >
                  <h2
                    className={cn(
                      "font-display font-extrabold tracking-[-0.02em] text-ink break-words",
                      titleClass(banner.title),
                      active && RISE
                    )}
                  >
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p
                      className={cn(
                        "mt-4 text-base md:text-lg leading-relaxed text-dark-700 max-w-[460px]",
                        active && RISE
                      )}
                      // Delay inline: class [animation-delay] bị shorthand `animation` của animate-rise ghi đè
                      style={{ animationDelay: "150ms" }}
                    >
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaLabel && banner.ctaHref && (
                    <Link
                      href={banner.ctaHref}
                      className={cn(
                        "mt-7 inline-flex items-center min-h-12 px-7 rounded-full bg-[rgb(var(--theme-coral))] text-white font-extrabold transition-shadow duration-300 hover:shadow-[0_10px_22px_-8px_rgb(var(--theme-coral)/0.7)] motion-safe:transition-[transform,box-shadow] motion-safe:hover:-translate-y-0.5",
                        FOCUS_RING,
                        active && RISE
                      )}
                      style={{ animationDelay: "300ms" }}
                    >
                      {banner.ctaLabel}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {count > 1 && (
            <div className="mt-8 flex gap-9">
              {banners.map((banner, index) => (
                <button
                  key={banner._id}
                  type="button"
                  aria-label={`Banner ${index + 1}`}
                  aria-current={index === current}
                  onClick={() => setCurrent(index)}
                  className={cn(
                    // Hit-area ≥ 44px: nới 18px mỗi phía (8 + 36); ngang nới đúng nửa gap-9 để các dot không đè vùng bấm của nhau
                    "relative h-2 rounded-full motion-safe:transition-all duration-300 after:absolute after:-inset-[18px] after:content-['']",
                    FOCUS_RING,
                    index === current
                      ? "w-6 bg-ink"
                      : "w-2 bg-ink/60 hover:bg-ink/80"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div
          {...swipeHandlers}
          className="relative h-[260px] sm:h-[340px] lg:h-[400px]"
        >
          {collage.map((banner, index) => {
            const tile = collage.length === 1 ? SINGLE_TILE : TILES[index];
            return (
              <div
                key={banner._id}
                className={cn(
                  "absolute",
                  tile.position,
                  // Ô của banner đang active nổi lên trên cùng
                  index === current ? "z-20" : "z-10"
                )}
              >
                <div
                  className="size-full motion-safe:animate-drift"
                  style={{
                    animationDuration: tile.duration,
                    animationDelay: tile.delay,
                  }}
                >
                  <div className="relative size-full overflow-hidden rounded-2xl bg-white ring-4 ring-white shadow-card-hover">
                    <Image
                      src={resolveImageUrl(banner.image)}
                      alt={banner.title}
                      fill
                      priority={index === 0}
                      // Kéo chuột trên <img> mở native drag, nuốt mousemove → swipe chuột không chạy
                      draggable={false}
                      sizes="(min-width: 768px) 30vw, 70vw"
                      aria-hidden={index !== current}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
