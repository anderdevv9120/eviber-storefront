"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { useBannerCycle } from "@/hooks/useBannerCycle";
import { cn } from "@/config/utils";
import type { ThemeHeroProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import { titleSplit } from "./titleSplit";

// Cỡ tiêu đề theo độ dài (CMS cho tới 200 ký tự) — tiêu đề ngắn mới được cỡ lớn.
// leading đứng SAU cỡ chữ: cn() (tailwind-merge) bỏ leading-* nằm trước text-[...]
const titleClass = (title: string) =>
  title.length <= 30
    ? "text-[clamp(40px,5.6vw,76px)] leading-[1.05]"
    : title.length <= 70
      ? "text-[clamp(32px,4vw,56px)] leading-[1.08]"
      : "text-[clamp(26px,2.8vw,40px)] leading-[1.15]";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const RISE = "motion-safe:animate-rise";

const Hero = ({ banners }: ThemeHeroProps) => {
  const { current, setCurrent, count, focusHandlers, swipeHandlers } =
    useBannerCycle(banners.length);

  if (count === 0) return null;

  return (
    <section
      aria-label="Banner khuyến mãi"
      {...focusHandlers}
      className="container-base pt-8 md:pt-12 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] items-center gap-10 lg:gap-16"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark-500">
          {BRAND.tagline}
        </p>
        {/* Các slide chồng cùng ô grid → cột cao theo slide dài nhất, đổi slide không nhảy layout */}
        <div className="grid grid-cols-1 mt-5">
          {banners.map((banner, index) => {
            const active = index === current;
            const { lead, accent } = titleSplit(banner.title);
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
                    "font-display font-normal text-ink tracking-[-0.01em] break-words",
                    titleClass(banner.title),
                    active && RISE
                  )}
                >
                  {lead}
                  {accent && (
                    <>
                      {" "}
                      <em className="text-terracotta">{accent}</em>
                    </>
                  )}
                </h2>
                {banner.subtitle && (
                  <p
                    className={cn(
                      "mt-5 text-base md:text-lg leading-relaxed text-dark-500 max-w-[460px]",
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
                      "mt-8 inline-flex items-center min-h-12 px-7 rounded-full border border-ink text-ink font-medium transition-colors duration-300 hover:bg-ink hover:text-page",
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
          <div className="mt-10 flex gap-9">
            {banners.map((banner, index) => (
              <button
                key={banner._id}
                type="button"
                aria-label={`Banner ${index + 1}`}
                aria-current={index === current}
                onClick={() => setCurrent(index)}
                className={cn(
                  // Hit-area ≥ 44px: nới 18px mỗi phía (8 + 36); ngang nới đúng nửa gap-9 để vùng bấm không đè nhau
                  "relative h-2 rounded-full motion-safe:transition-all duration-300 after:absolute after:-inset-[18px] after:content-['']",
                  FOCUS_RING,
                  index === current
                    ? "w-6 bg-ink"
                    : "w-2 bg-dark-300 hover:bg-dark-600"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative justify-self-center w-full max-w-[min(520px,calc((100svh_-_var(--hero-offset)_-_4rem)*0.8))]">
        <div
          {...swipeHandlers}
          className="relative aspect-[4/5] rounded-[999px_999px_10px_10px] overflow-hidden bg-primary-500 motion-safe:animate-fade"
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
              sizes="(min-width: 768px) 42vw, 100vw"
              aria-hidden={index !== current}
              className={cn(
                "object-cover transition-opacity duration-700",
                index === current ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
        {/* Bóng clay trôi chậm cạnh khung vòm — thuần trang trí */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-3 bottom-10 size-14 md:size-20 rounded-full bg-terracotta bg-[radial-gradient(rgb(var(--color-page)/0.55)_18%,transparent_20%)] [background-size:14px_14px] shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.12)] motion-safe:animate-drift"
          style={{ animationDuration: "11s" }}
        />
      </div>
    </section>
  );
};

export default Hero;
