import type { ReactNode } from "react";

// Mockup .center-head: eyebrow đỏ rượu + tiêu đề Playfair canh giữa (combo, lookbook, brand story)
const CenterHead = ({
  id,
  eyebrow,
  title,
  children,
}: {
  /** Cho aria-labelledby của section */
  id?: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) => (
  <div className="mx-auto mb-8 max-w-[720px] text-center md:mb-14">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-primary-700">
      {eyebrow}
    </p>
    <h2
      id={id}
      className="mt-2.5 font-display text-[clamp(30px,3.6vw,48px)] font-normal leading-[1.15] tracking-[-.015em] text-deep"
    >
      {title}
    </h2>
    {children && <p className="mt-3 text-dark-500">{children}</p>}
  </div>
);

export default CenterHead;
