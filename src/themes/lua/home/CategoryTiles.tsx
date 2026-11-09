import Image from "next/image";
import Link from "next/link";
import { PATH } from "@/constants/paths";
import { CATEGORY_TILES } from "./content";

// Mockup .tiles: 4 thẻ ảnh 3:4 trên band be; < md cuộn ngang scroll-snap, tràn mép phải
const CategoryTiles = () => (
  <section className="bg-white-100 py-14 md:py-24">
    <div className="container-base">
      <div className="section-head mb-7 md:mb-12">
        <h2 className="type-display-section font-display text-deep max-w-[13ch]">
          Chọn theo phong cách
        </h2>
        <p className="type-section-sub text-dark-500">
          Từ những gam màu dịu nhẹ đến sắc áo nổi bật, tìm thiết kế hợp với
          phong cách của nàng.
        </p>
      </div>

      <div className="grid grid-flow-col auto-cols-[72%] gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mr-[var(--container-px)] pr-[var(--container-px)] md:grid-flow-row md:grid-cols-4 md:gap-5 md:overflow-visible md:mr-0 md:pr-0">
        {CATEGORY_TILES.map(({ name, slug, image }) => (
          <Link
            key={slug}
            href={`${PATH.COLLECTION}?category=${encodeURIComponent(slug)}`}
            className="group relative block aspect-[3/4] overflow-hidden rounded snap-start text-white"
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 768px) 25vw, 72vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="absolute inset-0 bg-gradient-to-b from-transparent from-55% to-black/55" />
            <span className="absolute inset-x-5 bottom-5 font-display text-[clamp(20px,1.8vw,26px)] font-medium leading-tight">
              {name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryTiles;
