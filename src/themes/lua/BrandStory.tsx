import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/config/utils";
import type { ThemeBrandStoryProps } from "@/themes/types";
import CenterHead from "./home/CenterHead";
import { BRAND_STORY } from "./home/content";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const H3 =
  "mt-1.5 mb-3.5 font-display text-[clamp(26px,2.6vw,38px)] font-normal leading-[1.2] text-deep break-words";

// 1 hàng "guide row" của mockup son-lua (.story-row): viền nhấn trên, ảnh | chữ; reversed = .story-row.rev
const StoryRow = ({
  image,
  alt,
  reversed = false,
  eyebrow,
  children,
}: {
  image: string;
  alt: string;
  reversed?: boolean;
  eyebrow: string;
  children: ReactNode;
}) => (
  <div className="grid border-t-[3px] border-primary-700 bg-page md:grid-cols-2">
    <div
      className={cn(
        "relative aspect-[16/10] md:aspect-auto md:min-h-[360px]",
        reversed && "md:order-2"
      )}
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
    <div className="flex min-w-0 flex-col justify-center p-[clamp(28px,4vw,56px)]">
      <p className="text-xs font-semibold tracking-[.04em] text-primary-700">
        {eyebrow}
      </p>
      {children}
    </div>
  </div>
);

// Mockup: head giữa + 2 hàng so le. Ảnh 2 hàng cứng từ mockup (showcase, bỏ qua CMS image/image2);
// hàng 1 = chữ CMS, hàng 2 = copy cứng (CMS chỉ có 1 khối chữ)
// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: ThemeBrandStoryProps) => {
  const second = BRAND_STORY.second;
  return (
    <section
      id="story"
      aria-labelledby="story-h"
      className="bg-white-50 py-[clamp(56px,7vw,104px)]"
    >
      <div className="container-base">
        <CenterHead
          id="story-h"
          eyebrow="Câu chuyện CLOTHES"
          title={BRAND_STORY.heading}
        />

        <StoryRow
          image={BRAND_STORY.first.image}
          alt={BRAND_STORY.first.alt}
          eyebrow={BRAND_STORY.first.eyebrow}
        >
          <h3 className={H3}>
            {story.title}
            {story.titleAccent && (
              <>
                {" "}
                <em className="text-primary-700">{story.titleAccent}</em>
              </>
            )}
          </h3>
          <p className="max-w-[52ch] text-dark-500 whitespace-pre-line break-words">
            {story.body}
          </p>
          {story.ctaLabel && story.href && (
            <Link
              href={story.href}
              className={cn(
                "mt-5 inline-flex self-start items-center rounded-btn border-[1.5px] border-primary-700 px-[26px] py-[13px] text-[13px] font-semibold uppercase tracking-[.08em] text-primary-700 transition-colors hover:bg-primary-700 hover:text-white",
                FOCUS_RING
              )}
            >
              {story.ctaLabel}
            </Link>
          )}
        </StoryRow>

        <div className="mt-6">
          <StoryRow
            image={second.image}
            alt={second.alt}
            reversed
            eyebrow={second.eyebrow}
          >
            <h3 className={H3}>{second.title}</h3>
            <p className="max-w-[52ch] text-dark-500">{second.body}</p>
          </StoryRow>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
