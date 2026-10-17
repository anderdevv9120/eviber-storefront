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
      ? "text-[clamp(30px,3.8vw,50px)] leading-[1.08]"
      : "text-[clamp(24px,2.6vw,36px)] leading-[1.15]";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600";

// Chữ slide active "rise" lần lượt; gắn class khi slide thành active → animation chạy lại mỗi lần đổi
const RISE = "motion-safe:animate-rise";

const Hero = ({ banners }: ThemeHeroProps) => {
  const { current, setCurrent, count, focusHandlers, swipeHandlers } =
    useBannerCycle(banners.length);

  if (count === 0) return null;

  return (
    <section
      aria-label="Banner khuyến mãi"
      {...focusHandlers}
      className="container-base pt-4 md:pt-6"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white p-6 sm:p-10 lg:p-14 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-8 lg:gap-14">
        {/* Đường kẻ sân mờ xoay nghiêng — thuần CSS border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-[420px] rounded-xl border-2 border-white/10 rotate-[18deg] after:absolute after:inset-y-0 after:left-1/2 after:border-l-2 after:border-white/10 after:content-[''] before:absolute before:inset-x-0 before:top-[30%] before:border-t-2 before:border-white/10 before:content-['']"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 right-5 top-5 md:right-8 md:top-8 size-12 md:size-16 rounded-full bg-[rgb(var(--theme-accent))] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.08)] motion-safe:animate-drift"
        />

        <div className="relative min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--theme-accent))] pr-16">
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
                      "font-display font-extrabold tracking-[-0.03em] break-words",
                      titleClass(banner.title),
                      active && RISE
                    )}
                  >
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p
                      className={cn(
                        "mt-4 text-base md:text-lg leading-relaxed text-primary-100 max-w-[460px]",
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
                        "mt-7 inline-flex items-center gap-2 hover:gap-3.5 motion-safe:transition-[gap] duration-300 min-h-12 px-6 rounded-full bg-[rgb(var(--theme-accent))] text-ink font-bold",
                        FOCUS_RING,
                        active && RISE
                      )}
                      style={{ animationDelay: "300ms" }}
                    >
                      {banner.ctaLabel}
                      <span aria-hidden="true">→</span>
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
                      ? "w-6 bg-[rgb(var(--theme-accent))]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div
          {...swipeHandlers}
          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-primary-700"
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
              sizes="(min-width: 768px) 45vw, 100vw"
              aria-hidden={index !== current}
              className={cn(
                "object-cover transition-opacity duration-700",
                index === current ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
