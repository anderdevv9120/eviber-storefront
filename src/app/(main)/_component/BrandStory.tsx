import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import type { IBrandStory } from "@/@types/StoreContent.type";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

// Nội dung CMS là text thuần — xuống dòng bằng whitespace-pre-line, KHÔNG render HTML
const BrandStory = ({ story }: { story: IBrandStory }) => {
  return (
    <section
      aria-labelledby="brand-story-title"
      className="my-16 md:my-24 grid md:grid-cols-2 gap-8 md:gap-16 items-center"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <Image
          src={resolveImageUrl(story.image)}
          alt={story.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        {/* Cột chữ luôn canh trái — --section-head-align dành cho tiêu đề section full-width */}
        <h2
          id="brand-story-title"
          className="type-display-section font-display text-left text-primary-800 break-words"
        >
          {story.title}
        </h2>
        <p className="mt-4 md:mt-6 whitespace-pre-line break-words text-dark-500">
          {story.body}
        </p>
        {story.ctaLabel && story.href && (
          <Link href={story.href} className="inline-block mt-6 md:mt-8">
            <Button size="lg" variant="outline" className="px-6">
              {story.ctaLabel}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default BrandStory;
