import Image from "next/image";
import { REVIEWS } from "./content";

// Mockup "Nàng nói gì" (.head + .reviews): 3 thẻ review cứng (showcase) — thay CustomerReview/ContentSlider ở lua
const Reviews = () => (
  <section
    aria-labelledby="reviews-h"
    className="container-base my-16 md:my-24"
  >
    <div className="mb-[clamp(28px,3.5vw,48px)] flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
      <h2
        id="reviews-h"
        className="type-display-section max-w-[13ch] text-deep"
      >
        Nàng nói gì
      </h2>
      <p className="type-section-sub text-dark-500">
        Phản hồi từ những đơn hàng đã xác nhận mua.
      </p>
    </div>

    <div className="grid gap-5 min-[861px]:grid-cols-3">
      {REVIEWS.map((review) => (
        <article
          key={review.name}
          className="flex flex-col gap-4 rounded border border-white-200 bg-page p-7"
        >
          <p
            role="img"
            aria-label={`${review.rating}/5 sao`}
            className="text-base tracking-[2px] text-[#D9A441]"
          >
            {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
          </p>
          <blockquote className="font-display text-[17px] leading-[1.55] text-deep">
            {review.quote}
          </blockquote>
          <footer className="mt-auto flex items-center gap-3 text-[13px]">
            <Image
              src={review.image}
              alt=""
              width={44}
              height={56}
              className="h-14 w-11 shrink-0 rounded object-cover"
            />
            <div>
              <b className="block text-sm">{review.name}</b>
              <span className="text-dark-300">{review.item} · </span>
              {/* Mockup #108B67 chỉ 3.9:1 trên page → tối nhẹ cho đạt AA (4.8:1) ở cỡ 13px */}
              <span className="font-semibold text-[#0D7B5B]">✓ Đã mua</span>
            </div>
          </footer>
        </article>
      ))}
    </div>
  </section>
);

export default Reviews;
