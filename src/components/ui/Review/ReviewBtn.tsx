import { cn } from "@/config/utils";
import Button from "../Button";

interface Rating {
  title: string;
  id: number;
  value: number;
}

interface ReviewBtnProps {
  rating: Rating;
  ratingIndex?: number;
  onClick?: (id: number) => void;
}

const ReviewBtn = ({ rating, ratingIndex, onClick }: ReviewBtnProps) => {
  const handleClick = () => {
    onClick?.(rating.id);
  };

  return (
    <Button
      variant="outlined"
      className={cn(
        "h-10 max-w-40 px-6 mb-2 font-normal text-sm grow rounded sm:text-base sm:h-11 sm:max-w-56",
        rating.id === ratingIndex ? "text-white bg-primary-800" : ""
      )}
      onClick={handleClick}
    >
      {`${rating.title} (${rating.value})`}
    </Button>
  );
};

export default ReviewBtn;
