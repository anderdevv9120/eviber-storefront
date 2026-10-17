import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { ThemeBrandStoryProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Panel nền surface trong container; phần nhấn tiêu đề tô "bút dạ" vàng bóng (nền, không phải chữ vàng).
// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: ThemeBrandStoryProps) => (
  <div className="container-base my-16 md:my-24">
    <section
      aria-labelledby="story-h"
      className="rounded-2xl bg-white-100 p-4 sm:p-6 lg:p-10 grid md:grid-cols-2 gap-8 lg:gap-14 items-center"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white-300">
        <Image
          src={resolveImageUrl(story.image)}
          alt={story.title}
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 px-2 pb-4 md:p-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dark-500">
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
                <span className="bg-[linear-gradient(transparent_58%,rgb(var(--theme-accent))_58%)] [box-decoration-break:clone]">
                  {story.titleAccent}
                </span>
              </>
            )}
          </h2>
        </Reveal>
        <p className="mt-5 max-w-[520px] text-dark-500 whitespace-pre-line break-words">
          {story.body}
        </p>
        {story.ctaLabel && story.href && (
          <Link
            href={story.href}
            className="mt-7 inline-flex items-center min-h-12 px-6 rounded-full bg-primary-600 text-white font-semibold transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white-100"
          >
            {story.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  </div>
);

export default BrandStory;
