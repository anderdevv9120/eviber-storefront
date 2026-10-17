import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { ThemeBrandStoryProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Band biên tập full-bleed nền surface; phần nhấn tiêu đề in nghiêng clay (4.59:1 trên #EAE2D2).
// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: ThemeBrandStoryProps) => (
  <section aria-labelledby="story-h" className="mt-16 md:mt-24 bg-white-100">
    <div className="container-base py-16 md:py-24 grid md:grid-cols-[1fr_1.15fr] gap-10 lg:gap-20 items-center">
      <div className="relative aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-md bg-white-300">
        <Image
          src={resolveImageUrl(story.image)}
          alt={story.title}
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark-500">
          Câu chuyện của chúng tôi
        </p>
        <Reveal>
          <h2
            id="story-h"
            className="mt-5 font-display font-normal text-[clamp(36px,4.6vw,64px)] leading-[1.05] tracking-[-0.01em] text-ink break-words"
          >
            {story.title}
            {story.titleAccent && (
              <>
                {" "}
                <em className="text-terracotta">{story.titleAccent}</em>
              </>
            )}
          </h2>
        </Reveal>
        <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-dark-600 whitespace-pre-line break-words">
          {story.body}
        </p>
        {story.ctaLabel && story.href && (
          <Link
            href={story.href}
            className="mt-8 inline-flex items-center min-h-12 px-7 rounded-full border border-ink text-ink font-medium transition-colors duration-300 hover:bg-ink hover:text-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white-100"
          >
            {story.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  </section>
);

export default BrandStory;
