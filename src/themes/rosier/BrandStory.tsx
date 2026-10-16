import Image from "next/image";
import Link from "next/link";
import { cn } from "@/config/utils";
import type { ThemeBrandStoryProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white-300";

// Bám section "Our story" của mockup (design-showcase/site/atelier-rosier/index.html):
// band full-bleed, 2 khung vòm so le, eyebrow, phần nhấn tiêu đề in nghiêng.
// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: ThemeBrandStoryProps) => {
  const twoImages = !!story.image2;

  return (
    <section
      id="story"
      aria-labelledby="story-h"
      // Cỡ chữ/leading nền của mockup (15px / 1.55) — con kế thừa
      className="mt-[clamp(64px,8vw,112px)] bg-white-300 text-[15px] leading-[1.55]"
    >
      <div className="container-base py-[clamp(64px,8vw,112px)] grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[clamp(32px,5vw,80px)] items-center">
        <div
          className={cn(
            "grid gap-4",
            twoImages
              ? "grid-cols-2"
              : "grid-cols-1 w-full max-w-[420px] mx-auto"
          )}
        >
          <div className="relative aspect-[3/4] rounded-[999px_999px_24px_24px] bg-terracotta overflow-hidden">
            <Image
              src={resolveImageUrl(story.image)}
              alt={story.title}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          {story.image2 && (
            <div className="relative aspect-[3/4] rounded-[24px_24px_999px_999px] bg-dark-50 mt-16 overflow-hidden">
              <Image
                src={resolveImageUrl(story.image2)}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-[13px] tracking-[0.16em] uppercase text-primary-800">
            Câu chuyện của chúng tôi
          </div>
          <h2
            id="story-h"
            className="mt-5 font-display font-normal text-[clamp(44px,5.5vw,84px)] leading-[0.95] text-dark-800 break-words"
          >
            {story.title}
            {story.titleAccent && (
              <>
                {" "}
                <em className="text-primary-600">{story.titleAccent}</em>
              </>
            )}
          </h2>
          <p className="mt-7 max-w-[480px] text-[17px] text-dark-600 whitespace-pre-line break-words">
            {story.body}
          </p>
          {story.ctaLabel && story.href && (
            <Link
              href={story.href}
              className={cn(
                "inline-flex items-center min-h-[52px] px-7 mt-8 border border-dark-800 rounded-[999px] font-semibold transition-colors hover:bg-dark-800 hover:text-white-100",
                FOCUS_RING
              )}
            >
              {story.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
