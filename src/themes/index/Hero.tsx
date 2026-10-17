"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/config/utils";
import { useBannerCycle } from "@/hooks/useBannerCycle";
import type { ThemeHeroProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

export default function Hero({ banners }: ThemeHeroProps) {
  const { current, setCurrent, count, focusHandlers, swipeHandlers } =
    useBannerCycle(banners.length);
  if (count === 0) return null;

  return (
    <section
      aria-label="Banner khuyến mãi"
      {...focusHandlers}
      className="border-b border-ink"
    >
      <div className="container-base grid md:grid-cols-2">
        <div className="min-w-0 py-8 md:py-12 md:pr-10 lg:py-16">
          <p className="tabular-nums text-sm font-medium">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </p>
          <div className="mt-8 grid">
            {banners.map((banner, index) => {
              const active = current === index;
              const title = banner.title.trim();
              const lastSpace = title.lastIndexOf(" ");
              return (
                <div
                  key={banner._id}
                  aria-hidden={!active}
                  inert={!active}
                  className={cn(
                    "[grid-area:1/1] min-w-0 motion-safe:transition-opacity motion-safe:duration-500",
                    active ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                >
                  <h2
                    className={cn(
                      "font-display font-bold tracking-[-0.05em] break-words",
                      title.length > 70
                        ? "text-[clamp(28px,3vw,44px)]"
                        : "text-[clamp(32px,4.5vw,64px)]",
                      "leading-[1.2]",
                      active && "motion-safe:animate-rise"
                    )}
                  >
                    {lastSpace >= 0 && `${title.slice(0, lastSpace)} `}
                    <span className="text-[rgb(var(--theme-accent))]">
                      {title.slice(lastSpace + 1)}
                    </span>
                  </h2>
                  {banner.subtitle && (
                    <p
                      className={cn(
                        "mt-5 max-w-md text-base leading-relaxed text-dark-500",
                        active && "motion-safe:animate-rise"
                      )}
                      style={{ animationDelay: "150ms" }}
                    >
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaLabel && banner.ctaHref && (
                    <Link
                      href={banner.ctaHref}
                      className={cn(
                        "mt-6 inline-flex min-h-11 items-center font-semibold underline underline-offset-8 decoration-ink hover:decoration-[rgb(var(--theme-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                        active && "motion-safe:animate-rise"
                      )}
                      style={{ animationDelay: "300ms" }}
                    >
                      {banner.ctaLabel}
                      <span
                        aria-hidden="true"
                        className="ml-3 text-[rgb(var(--theme-accent))]"
                      >
                        ↗
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          {count > 1 && (
            <div className="mt-6 flex flex-wrap" aria-label="Chọn banner">
              {banners.map((banner, index) => (
                <button
                  key={banner._id}
                  type="button"
                  aria-label={`Banner ${index + 1}`}
                  aria-current={index === current}
                  onClick={() => setCurrent(index)}
                  className="grid size-11 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
                >
                  <span
                    className={cn(
                      "h-1 w-5",
                      index === current ? "bg-ink" : "bg-dark-400"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          {...swipeHandlers}
          className="relative min-h-[300px] border-t border-ink bg-white-100 md:min-h-[460px] md:border-l md:border-t-0"
        >
          <Image
            key={current}
            src={resolveImageUrl(banners[current].image)}
            alt=""
            fill
            priority={current === 0}
            draggable={false}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover motion-safe:animate-wipe"
          />
        </div>
      </div>
    </section>
  );
}
