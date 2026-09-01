"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ButtonChevron from "@/components/ui/ButtonChevron";
import useCustomSwipeable from "@/hooks/useCustomSwipeable";
import { cn } from "@/config/utils";
import { IBanner } from "@/@types/Home.type";
import { PATH } from "@/constants/paths";

const AUTO_SLIDE_MS = 5000;

interface HeroBannerProps {
  banners: IBanner[];
}

const HeroBanner = ({ banners }: HeroBannerProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [banners.length, current]);

  const handlePrev = () =>
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev + 1) % banners.length);

  // Hook phải gọi trước early-return (rules of hooks)
  const swipeHandlers = useCustomSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
  });

  if (banners.length === 0) return null;

  return (
    <section aria-label="Banner khuyến mãi" className="w-full">
      <div
        {...swipeHandlers}
        className="relative overflow-hidden group/rail aspect-[4/3] sm:aspect-[2/1] lg:aspect-[3/1]"
      >
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === current
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            aria-hidden={index !== current}
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* Mobile scrim đậm hơn — caption phủ gần hết bề ngang ảnh, scrim desktop không đủ tương phản */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/20 md:from-white/90 md:via-white/50 md:to-transparent" />

            {/* Caption lồng container-base để thẳng hàng với nội dung trang.
                container-base phải đứng MỘT MÌNH không kèm utility kích thước —
                nó nằm trong @layer components nên mọi w-* utility sẽ đè width */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full">
                <div className="container-base">
                  <div className="max-w-[420px]">
                    <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-dark-800">
                      {banner.title}
                    </h2>
                    {/* Subtitle dark-700 đậm hơn chuẩn dark-500 vì nằm trên ảnh qua scrim */}
                    {banner.subtitle && (
                      <p className="mt-2 text-sm md:text-base text-dark-700">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.ctaLabel && (
                      <Link
                        href={banner.ctaHref || PATH.COLLECTION}
                        tabIndex={index === current ? undefined : -1}
                        className="inline-flex items-center mt-5 h-11 md:h-12 px-7 rounded-xl bg-primary text-white font-semibold text-sm md:text-base hover:bg-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
                      >
                        {banner.ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            {/* Mobile hero điều hướng bằng swipe + dots — chevron hiện sẵn sẽ đè caption */}
            <ButtonChevron
              className="left-3 hidden md:block"
              onClick={handlePrev}
            />
            <ButtonChevron
              isRightButton
              className="right-3 hidden md:block"
              onClick={handleNext}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner._id}
                  type="button"
                  aria-label={`Chuyển đến banner ${index + 1}`}
                  aria-current={index === current}
                  onClick={() => setCurrent(index)}
                  className={cn(
                    // Hit-area dọc 40px; ngang chỉ nới nửa gap để các dot không đè vùng bấm của nhau
                    "relative h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 after:absolute after:-inset-x-1 after:-inset-y-4 after:content-['']",
                    index === current
                      ? "w-5 bg-primary"
                      : "w-2 bg-white/80 ring-1 ring-dark-800/30 hover:bg-white"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
