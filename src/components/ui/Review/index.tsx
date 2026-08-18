"use client";

import { useMemo, useState } from "react";
import ReviewHeader from "./ReviewHeader";
import ReviewComment from "./ReviewComment";
import Pagination from "../Pagination";
import { ReviewCommentProps } from "./ReviewComment";

interface ReviewProps {
  dataReviews: {
    averageRating: number;
    ratings: {
      title: string;
      id: number;
      value: number;
    }[];
    comments: (ReviewCommentProps | Partial<ReviewCommentProps>)[];
  };
}

const Review = ({ dataReviews }: ReviewProps) => {
  const [page, setPage] = useState(1);
  const [selectedRatingId, setSelectedRatingId] = useState<number | undefined>(
    dataReviews.ratings[0]?.id
  );
  const pageSize = 5;

  // Lọc thật theo nút đang chọn (dựa vào title cho bền)
  const filteredComments = useMemo(() => {
    const selected = dataReviews.ratings.find((r) => r.id === selectedRatingId);
    const title = selected?.title ?? "";

    // "Tất cả" hoặc không xác định → hiển thị tất cả
    if (!selected || /tất cả/i.test(title)) return dataReviews.comments;

    // "Có hình ảnh / Video" → chỉ đánh giá có ảnh
    if (/hình ảnh|video/i.test(title)) {
      return dataReviews.comments.filter((c) => (c.images?.length ?? 0) > 0);
    }

    // "x Sao" → lọc theo số sao (làm tròn rating)
    const starMatch = title.match(/\d+/);
    if (starMatch) {
      const star = Number(starMatch[0]);
      return dataReviews.comments.filter(
        (c) => Math.round(c.rating ?? 0) === star
      );
    }

    return dataReviews.comments;
  }, [dataReviews.comments, dataReviews.ratings, selectedRatingId]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentComments = filteredComments.slice(startIndex, endIndex);

  const onPaginationChange = (currentPage: number) => {
    setPage(currentPage);
  };
  const handleClickBtn = (ratingId: number) => {
    setSelectedRatingId(ratingId);
    setPage(1); // reset về trang 1 khi đổi bộ lọc
  };

  return (
    <>
      <ReviewHeader
        ratings={dataReviews.ratings}
        averageRating={dataReviews.averageRating}
        onClickBtn={handleClickBtn}
      />

      <div className="py-4">
        {currentComments.map((comment, index) => (
          <ReviewComment key={comment.id ?? index} {...comment} />
        ))}
      </div>
      <Pagination
        total={filteredComments.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={onPaginationChange}
        className="pb-8"
      />
    </>
  );
};

export default Review;
