"use client";

import { useState } from "react";
import RatingStar from "../RatingStar";
import ReviewBtn from "./ReviewBtn";

interface RatingInfo {
  title: string;
  id: number;
  value: number;
}

interface ReviewHeaderProps {
  ratings: RatingInfo[];
  averageRating: number;
  onClickBtn: (ratingValue: number) => void;
}
const ReviewHeader = ({
  ratings,
  averageRating,
  onClickBtn,
}: ReviewHeaderProps) => {
  // Khởi tạo theo nút đầu tiên thay vì cứng =1 (id có thể không bắt đầu từ 1)
  const [ratingIndex, setRatingIndex] = useState(() => ratings[0]?.id);

  const handleClickBtn = (ratingId: number) => {
    setRatingIndex(ratingId);
    onClickBtn(ratingId);
  };
  return (
    <div className="bg-primary-50 p-4 rounded">
      <h1 className="text-lg font-medium md:mb-2 text-center md:text-start">
        ĐÁNH GIÁ SẢN PHẨM
      </h1>
      <div className="md:flex gap-x-4">
        <div className="min-w-44 flex justify-center items-center md:block">
          <p className="text-2xl text-center text-primary-800 mr-4 my-4 md:text-3xl">
            {averageRating}/5
          </p>
          <div className="flex justify-center">
            <RatingStar
              rating={averageRating}
              classStar="mx-1 w-4 h-4 md:w-5 md:h-5"
              decorative
            />
          </div>
        </div>

        <div className="flex-1 flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
          {ratings.map((rating, index) => (
            <ReviewBtn
              key={index}
              rating={rating}
              ratingIndex={ratingIndex}
              onClick={handleClickBtn}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewHeader;
