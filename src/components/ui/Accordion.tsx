"use client";

import { ReactNode, useState, memo } from "react";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/config/utils";
import FadeWrapper from "./FadeWrapper";

interface AccordionProps {
  headerTitle: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

const Accordion = ({
  headerTitle,
  children,
  className,
  headerClassName,
}: AccordionProps) => {
  const [isCollapse, setIsCollapse] = useState(true);

  return (
    <div className={cn("mb-7", className)}>
      <button
        type="button"
        className="flex justify-between items-center select-none w-full text-left cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
        aria-expanded={isCollapse}
        onClick={() => setIsCollapse(!isCollapse)}
      >
        <span className={cn("font-medium text-xl", headerClassName)}>
          {headerTitle}
        </span>
        <ChevronDown
          width="10"
          height="8"
          className={cn(
            "transform duration-100 text-primary",
            isCollapse ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      <FadeWrapper isVisible={isCollapse} className="flex flex-col">
        {children}
      </FadeWrapper>
    </div>
  );
};

export default memo(Accordion);
