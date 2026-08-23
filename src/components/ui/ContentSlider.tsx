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
    <section className="overflow-hidden my-16 md:my-24">
      <h2 className="text-2xl md:text-3xl text-primary-800 text-center uppercase font-bold tracking-wide">
        {title}
      </h2>
      {subtitle && (
        <p className="text-center text-sm text-dark-400 mt-1">{subtitle}</p>
      )}

      {href && (
        <div className="flex justify-end mb-4 mt-1">
          <Link
            href={href}
            className="group/link flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
          >
            Xem tất cả
            <RightArrow className="w-4 h-4 transition-transform duration-300 ease-out group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      )}
      {!href && <div className="mb-5" />}

      {children}
    </section>
  );
};

export default memo(ContentSlider);
