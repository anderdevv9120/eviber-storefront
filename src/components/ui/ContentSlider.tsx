import { ReactNode, memo } from "react";
import Link from "next/link";
import { RightArrow } from "../icons";

interface IContentSliderProps {
  title: string;
  subtitle?: string;
  href?: string;
  children?: ReactNode;
}

const ContentSlider = ({
  title,
  subtitle,
  href,
  children,
}: IContentSliderProps) => {
  return (
    // KHÔNG đặt overflow-hidden ở section — shadow-card của card con sẽ bị xén;
    // clipping ngang do từng rail tự quản trong container riêng của nó
    <section className="my-16 md:my-24">
      <h2 className="type-display-section font-display text-deep">{title}</h2>
      {subtitle && (
        <p className="[text-align:var(--section-head-align)] text-sm text-dark-500 mt-1">
          {subtitle}
        </p>
      )}

      {href && (
        <div className="flex justify-end mb-6 mt-1">
          <Link
            href={href}
            className="group/link relative flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors after:absolute after:-inset-x-2 after:-inset-y-2.5 after:content-['']"
          >
            Xem tất cả
            <RightArrow className="w-4 h-4 transition-transform duration-300 ease-out group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      )}
      {!href && <div className="mb-6" />}

      {children}
    </section>
  );
};

export default memo(ContentSlider);
