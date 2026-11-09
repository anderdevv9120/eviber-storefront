import Image from "next/image";
import Link from "next/link";
import CenterHead from "./CenterHead";
import { LOOKBOOK } from "./content";

// Mockup .mosaic: poster lớn (gradient ngà bên trái) + lưới 2×2 ô vuông có nhãn — thay PromoSplitBanner ở lua
const Lookbook = () => {
  const { poster, tiles } = LOOKBOOK;
  return (
    <section className="bg-white-100 py-14 md:py-24">
      <div className="container-base">
        <CenterHead eyebrow="Lookbook" title="Một bộ đồ, nhiều khoảnh khắc">
          Khi dạo bước, lúc ngồi lại hay trong một khung hình thân quen — tìm
          cảm hứng phối đồ theo cách của nàng.
        </CenterHead>

        <div className="grid gap-4 md:grid-cols-[1.05fr_1fr]">
          <Link
            href={poster.href}
            className="group relative block min-h-[420px] overflow-hidden rounded"
          >
            <Image
              src={poster.image}
              alt={poster.alt}
              fill
              sizes="(min-width: 768px) 52vw, 100vw"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-page/90 via-page/65 via-45% to-transparent to-75%" />
            <div className="absolute left-[clamp(24px,5vw,72px)] top-1/2 max-w-[75%] -translate-y-1/2 text-deep md:max-w-[60%]">
              <h3 className="font-display text-[clamp(48px,6vw,92px)] leading-[1.1] tracking-[-.02em]">
                {poster.titleLines[0]}
                <span className="block whitespace-nowrap pl-[1.4em]">
                  {poster.titleLines[1]}
                </span>
              </h3>
              <div
                aria-hidden="true"
                className="my-5 flex items-center gap-3 text-primary-700 before:h-px before:flex-1 before:bg-primary-700 before:opacity-50 before:content-[''] after:h-px after:flex-1 after:bg-primary-700 after:opacity-50 after:content-[''] md:mb-[18px] md:mt-6"
              >
                ✿
              </div>
              <p className="mb-5 font-display text-[22px] italic leading-[1.3]">
                {poster.line}
              </p>
              <span className="inline-flex items-center rounded-btn border-[1.5px] px-6 py-3 text-[13px] font-semibold uppercase tracking-[.08em] border-primary-700 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                {poster.ctaLabel}
              </span>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            {tiles.map((tile) => (
              <Link
                key={tile.label}
                href={tile.href}
                className="group relative block aspect-square overflow-hidden rounded"
              >
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  sizes="(min-width: 768px) 24vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute bottom-3.5 left-3.5 rounded-full bg-page px-3 py-1.5 text-xs font-semibold uppercase tracking-[.06em] text-deep">
                  {tile.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Lookbook;
