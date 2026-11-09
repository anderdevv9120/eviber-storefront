import Image from "next/image";
import Link from "next/link";
import { cn } from "@/config/utils";
import type { ThemeBrandStoryProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-page";

// Bám hàng "guide row" của mockup son-lua (.story-row): viền nhấn trên, ảnh | chữ, band soft.
// image2 bỏ qua — hàng thứ 2 cần chữ riêng mà CMS không có.
// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: ThemeBrandStoryProps) => (
  <section
    id="story"
    aria-labelledby="story-h"
    className="bg-white-50 py-[clamp(56px,7vw,104px)]"
  >
    <div className="container-base">
      <div className="grid border-t-[3px] border-primary-700 bg-page md:grid-cols-2">
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px]">
          <Image
            src={resolveImageUrl(story.image)}
            alt={story.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center p-[clamp(28px,4vw,56px)]">
          <p className="text-xs font-semibold tracking-[.04em] text-primary-700">
            Câu chuyện CLOTHES
          </p>
          <h2
            id="story-h"
            className="mt-1.5 mb-3.5 font-display text-[clamp(30px,3.2vw,48px)] font-normal leading-[1.2] text-deep break-words"
          >
            {story.title}
            {story.titleAccent && (
              <>
                {" "}
                <em className="text-primary-700">{story.titleAccent}</em>
              </>
            )}
          </h2>
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
        </div>
      </div>
    </div>
  </section>
);

export default BrandStory;
