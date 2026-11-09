import Image from "next/image";
import Link from "next/link";
import type { IComboCard } from "@/@types/Combo.type";
import { cn } from "@/config/utils";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import CenterHead from "./CenterHead";
import { COMBO_SLOT_COPY } from "./content";
import { pickComboBlocks } from "./comboBlock";

const PILL =
  "inline-flex items-center rounded-btn border-[1.5px] px-6 py-3 text-[13px] font-semibold uppercase tracking-[.08em] transition-colors";

// Mockup .split: ảnh lớn + copy trang trí | panel tint với strip món, giá thật. Khối 2 lật ngược ở lg.
const ComboSplit = ({ combos }: { combos: IComboCard[] }) => {
  const blocks = pickComboBlocks(combos);
  if (blocks.length === 0) return null;

  return (
    <section className="container-base my-16 md:my-24">
      <CenterHead
        eyebrow="Combo phối sẵn – nâng tầm phong cách"
        title="Sắc riêng trong từng bộ đồ"
      />

      <div className="flex flex-col gap-10 md:gap-[clamp(40px,5vw,72px)]">
        {blocks.map((view, index) => {
          const copy = COMBO_SLOT_COPY[index];
          const reversed = index % 2 === 1;
          return (
            <article
              key={view.href}
              className="grid border-t-[3px] border-primary-700 lg:grid-cols-2"
            >
              <div
                className={cn(
                  "relative flex min-h-[440px] items-center justify-center overflow-hidden bg-primary-900 p-6 text-white lg:min-h-[520px] lg:px-[8%]",
                  reversed ? "lg:order-2 lg:justify-start" : "lg:justify-end"
                )}
              >
                {view.image && (
                  <Image
                    src={resolveImageUrl(view.image)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
                {/* Ảnh combo CMS thường nền sáng: scrim ≥ 55% dưới vùng chữ (từ 45% bề ngang ở lg) + text-shadow
                    như Hero → chữ trắng nhỏ đạt AA kể cả ảnh trắng; gradient mockup (5% → 55%) không đủ */}
                <span
                  className={cn(
                    "absolute inset-0 bg-black/55 lg:bg-transparent lg:from-black/20 lg:via-black/55 lg:via-45% lg:to-black/60",
                    reversed ? "lg:bg-gradient-to-l" : "lg:bg-gradient-to-r"
                  )}
                />
                <div className="relative max-w-[300px] text-center [text-shadow:0_1px_14px_rgb(0_0_0/0.35)]">
                  <p className="text-[11px] uppercase tracking-[.3em]">
                    {copy.eyebrow}
                  </p>
                  <p className="mb-4 mt-2.5 font-display text-[clamp(36px,3.6vw,52px)] italic leading-[1.1]">
                    {copy.titleLines[0]}
                    <br />
                    {copy.titleLines[1]}
                  </p>
                  <p className="mb-5 text-sm opacity-90">{copy.quote}</p>
                  <Link
                    href={view.href}
                    className={cn(
                      PILL,
                      "border-white hover:bg-white hover:text-deep"
                    )}
                  >
                    Khám phá ngay
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-6 bg-primary-50 p-5 md:p-7">
                {view.pieces.length > 0 && (
                  // Số cột = số món (1–3): combo 2 món không để trống cột thứ 3
                  <div
                    className="grid gap-1.5"
                    style={{
                      gridTemplateColumns: `repeat(${view.pieces.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {view.pieces.map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        className="relative aspect-[3/4] overflow-hidden rounded bg-white-200"
                      >
                        <Image
                          src={resolveImageUrl(src)}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 15vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {/* 1 cột (mockup để tên cột auto) — tên combo thật dài, cột auto sẽ ép mô tả */}
                <div className="flex flex-col items-start gap-2">
                  <h3 className="font-display text-[clamp(28px,2.6vw,40px)] leading-[1.15] text-primary-700">
                    {view.name}
                  </h3>
                  <p className="text-dark-500">{copy.description}</p>
                  {view.price === null ? (
                    <p className="font-semibold text-dark-500">Hết hàng</p>
                  ) : (
                    <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <b className="text-lg text-primary-700">{view.price}</b>
                      {view.originalPrice && (
                        <s className="text-[13px] text-dark-500">
                          {view.originalPrice}
                        </s>
                      )}
                      {view.saving && (
                        <span className="rounded-full bg-primary-700/[.12] px-2 py-0.5 text-xs font-bold text-primary-900">
                          {view.saving}
                        </span>
                      )}
                    </p>
                  )}
                  <Link
                    href={view.href}
                    className={cn(
                      PILL,
                      "mt-2.5 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white"
                    )}
                  >
                    Xem combo
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ComboSplit;
