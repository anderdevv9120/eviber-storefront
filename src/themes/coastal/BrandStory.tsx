import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { ThemeBrandStoryProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Panel cát bo tròn, ảnh trên ô trắng xoay nhẹ + mặt trời; phần nhấn tiêu đề tô coral
// (chữ display ≥ 26px/800 = chữ lớn: coral trên sand 4.40 ≥ 3:1).
// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: ThemeBrandStoryProps) => (
  <div className="container-base my-16 md:my-24">
    <section
      aria-labelledby="story-h"
      className="relative overflow-hidden rounded-3xl bg-[rgb(var(--theme-sand))] p-5 sm:p-8 lg:p-12 grid md:grid-cols-2 gap-10 lg:gap-14 items-center"
    >
      <div className="relative w-full max-w-[520px] justify-self-center p-3">
        <div
          aria-hidden="true"
          className="absolute -left-2 -top-2 size-20 md:size-24 rounded-full bg-[rgb(var(--theme-sun))]"
        />
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white ring-8 ring-white shadow-card-hover -rotate-2">
          <Image
            src={resolveImageUrl(story.image)}
            alt={story.title}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="relative min-w-0">
        <p className="text-sm font-semibold text-dark-700">
          Câu chuyện của chúng tôi
        </p>
        <Reveal>
          <h2
            id="story-h"
            className="mt-3 type-display-section font-display text-deep break-words"
          >
            {story.title}
            {story.titleAccent && (
              <>
                {" "}
                <span className="text-[rgb(var(--theme-coral))]">
                  {story.titleAccent}
                </span>
              </>
            )}
          </h2>
        </Reveal>
        <p className="mt-5 max-w-[520px] text-dark-700 leading-relaxed whitespace-pre-line break-words">
          {story.body}
        </p>
        {story.ctaLabel && story.href && (
          <Link
            href={story.href}
            className="mt-7 inline-flex items-center min-h-12 px-7 rounded-full bg-[rgb(var(--theme-coral))] text-white font-extrabold transition-shadow duration-300 hover:shadow-[0_10px_22px_-8px_rgb(var(--theme-coral)/0.7)] motion-safe:transition-[transform,box-shadow] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--theme-sand))]"
          >
            {story.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  </div>
);

export default BrandStory;
