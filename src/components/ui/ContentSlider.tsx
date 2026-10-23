import { ReactNode, memo } from "react";
import Link from "next/link";
import { cn } from "@/config/utils";
import { RightArrow } from "../icons";

interface IContentSliderProps {
  title: string;
  subtitle?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
}

const ContentSlider = ({
  title,
  subtitle,
  href,
  children,
  className,
}: IContentSliderProps) => {
  return (
    // KHÔNG đặt overflow-hidden ở section — shadow-card của card con sẽ bị xén;
    // clipping ngang do từng rail tự quản trong container riêng của nó
    <section className={cn("my-16 md:my-24", className)}>
      <div className="section-head mb-6">
        <h2 className="type-display-section font-display text-deep">{title}</h2>
        {subtitle && (
          <p className="type-section-sub text-dark-500">{subtitle}</p>
        )}
        {/* ml-auto: rosier xếp cùng hàng tiêu đề, wrap xuống vẫn bám phải; classic (block) thành hàng riêng canh phải */}
        {href && (
          <div className="flex justify-end ml-auto">
            <Link
              href={href}
              className="group/link relative flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors after:absolute after:-inset-x-2 after:-inset-y-2.5 after:content-['']"
            >
              Xem tất cả
              <RightArrow className="w-4 h-4 transition-transform duration-300 ease-out group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>

      {children}
    </section>
  );
};

export default memo(ContentSlider);
