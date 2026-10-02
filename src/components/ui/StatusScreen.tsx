import { ReactNode } from "react";
import { cn } from "@/config/utils";

interface StatusScreenProps {
  illustration: ReactNode;
  title: string;
  description: string;
  actions: ReactNode;
  className?: string;
}

/** Màn trạng thái toàn trang (404, lỗi runtime...) — một khung cho mọi màn cùng vai */
export default function StatusScreen({
  illustration,
  title,
  description,
  actions,
  className,
}: StatusScreenProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center px-4 py-16 text-center md:py-24",
        className
      )}
    >
      <div className="mb-7">{illustration}</div>
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-dark-500">{description}</p>
      <div className="mt-7 flex w-full flex-wrap items-center justify-center gap-4">
        {actions}
      </div>
    </section>
  );
}
