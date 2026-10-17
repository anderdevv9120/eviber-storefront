import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { ThemeBrandStoryProps } from "@/themes/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

export default function BrandStory({ story }: ThemeBrandStoryProps) {
  return (
    <div className="grid border-y border-ink md:grid-cols-2">
      <div className="relative aspect-[4/3] bg-white-100 md:aspect-auto md:min-h-[400px]">
        <Image
          src={resolveImageUrl(story.image)}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 border-t border-ink p-6 md:border-l md:border-t-0 md:p-10">
        <Reveal>
          <h3 className="type-display-sub font-display text-ink break-words">
            {story.title}
            {story.titleAccent && (
              <>
                {" "}
                <span>{story.titleAccent}</span>
              </>
            )}
          </h3>
        </Reveal>
        <p className="mt-5 whitespace-pre-line break-words text-dark-500 leading-relaxed">
          {story.body}
        </p>
        {story.ctaLabel && story.href && (
          <Link
            href={story.href}
            className="mt-6 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:decoration-[rgb(var(--theme-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {story.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
