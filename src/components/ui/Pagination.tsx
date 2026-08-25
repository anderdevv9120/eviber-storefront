"use client";

import { memo, Fragment, useMemo } from "react";
import { cn } from "@/config/utils";
import { ChevronDown } from "@/components/icons";
import { useIsTablet } from "@/hooks/useMediaQuery";

export interface PaginationProps {
  total: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
  numberPage?: number;
}

const PAGINATION_SIZE = 5;

const classArrow =
  "w-[36px] h-[36px] flex justify-center items-center rounded-lg border border-white-600 text-dark-500 transition duration-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100";

const Pagination = ({
  total,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  className,
  numberPage,
}: PaginationProps) => {
  const isTablet = useIsTablet();

  const { totalPages, pages } = useMemo(
    () =>
      getPageInfo(
        total,
        currentPage,
        pageSize,
        numberPage || (isTablet ? 3 : PAGINATION_SIZE)
      ),
    [total, currentPage, pageSize, numberPage, isTablet]
  );

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center mt-6", className)}>
      <div className="flex items-center gap-2 select-none">
        <ButtonArrow
          isLeftButton
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        />

        {pages.map((number, index) => (
          <Fragment key={index}>
            {number === -1 ? (
              <span className="mx-2 text-base text-dark-300">…</span>
            ) : (
              <button
                onClick={() => onPageChange(number)}
                aria-current={number === currentPage ? "page" : undefined}
                className={cn(
                  "w-[36px] h-[36px] rounded-lg flex items-center justify-center text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
                  number === currentPage
                    ? "bg-primary text-white"
                    : "bg-white text-dark-500 border border-white-600 hover:border-primary-300 hover:text-primary-700"
                )}
              >
                {number}
              </button>
            )}
          </Fragment>
        ))}

        <ButtonArrow
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </div>
    </div>
  );
};

type ButtonArrowProps = {
  isLeftButton?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const ButtonArrow = ({ isLeftButton, disabled, onClick }: ButtonArrowProps) => {
  return (
    <button
      aria-label={isLeftButton ? "Trang trước" : "Trang sau"}
      className={classArrow}
      disabled={disabled}
      onClick={onClick}
    >
      <ChevronDown
        width="12"
        height="12"
        className={cn(
          "transform transition-transform duration-200",
          isLeftButton ? "rotate-90" : "rotate-[270deg]"
        )}
      />
    </button>
  );
};

const getPageInfo = (
  total: number,
  currentPage: number,
  pageSize: number,
  paginationSize: number = PAGINATION_SIZE
) => {
  const distance = Math.floor(paginationSize / 2);
  const totalPages = Math.ceil(total / pageSize);
  // Caller có thể đưa page ngoài dải (deep-link ?page=99 trước khi kịp clamp URL) —
  // không kẹp là startPage âm, render nút trang "0"
  currentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  let startPage, endPage;

  if (totalPages <= paginationSize) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= Math.ceil(paginationSize / 2)) {
      startPage = 1;
      endPage = paginationSize;
    } else if (currentPage + distance >= totalPages) {
      startPage = totalPages - (paginationSize - 1);
      endPage = totalPages;
    } else {
      startPage = currentPage - distance;
      endPage = currentPage + distance;
    }
  }

  let pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  if (startPage > 1) {
    pages.unshift(1);
    if (startPage > 2) pages.splice(1, 0, -1);
  }
  if (endPage < totalPages - 1) pages.push(-1);
  if (endPage < totalPages) pages.push(totalPages);

  return { totalPages, pages };
};

export default memo(Pagination);
