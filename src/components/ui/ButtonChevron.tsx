import { cn } from "@/config/utils";
import { ChevronLeft } from "@/components/icons";

interface ButtonChevronProps {
  isRightButton?: boolean;
  className?: string;
  onClick?: () => void;
}

const ButtonChevron = ({
  className,
  onClick,
  isRightButton,
}: ButtonChevronProps) => {
  return (
    <button
      className={cn(
        // Dưới lg (touch, không có hover) chevron hiện sẵn; từ lg mới ẩn chờ hover rail
        "absolute z-10 top-1/2 transform -translate-y-1/2 md:p-3 p-2.5 bg-white rounded-full border transition-all duration-300 lg:opacity-0 lg:pointer-events-none",
        isRightButton
          ? "lg:translate-x-4 group-hover/rail:translate-x-0 right-2"
          : "lg:-translate-x-4 group-hover/rail:translate-x-0 left-2",
        "group-hover/rail:opacity-100 group-hover/rail:pointer-events-auto",
        "focus:outline-none focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:translate-x-0 focus-visible:ring-2 focus-visible:ring-primary-100",
        "hover:border-primary-500 hover:shadow-lg",
        className
      )}
      aria-label={isRightButton ? "Next slide" : "Previous slide"}
      onClick={onClick}
    >
      <ChevronLeft
        className={cn(
          "w-4 h-4 xl:w-5 xl:h-5 transition-all duration-200 group-hover/rail:text-primary-500",
          isRightButton && "rotate-180"
        )}
      />
    </button>
  );
};

export default ButtonChevron;
