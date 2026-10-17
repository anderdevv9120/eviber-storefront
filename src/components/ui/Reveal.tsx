"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/config/utils";

interface RevealProps {
  children: ReactNode;
  as?: "div" | "section" | "li";
  /** ms */
  delay?: number;
  className?: string;
}

const Reveal = ({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: RevealProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-shown", "");
    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show();
        io.disconnect();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "motion-safe:opacity-0 motion-safe:translate-y-4 motion-safe:transition motion-safe:duration-700 data-[shown]:opacity-100 data-[shown]:translate-y-0",
        className
      )}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
