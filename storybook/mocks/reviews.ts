import { LOCAL_AVATAR, REVIEW_IMG_1, REVIEW_IMG_2 } from "./images";

/**
 * Dữ liệu review tự chứa cho <Review />.
 * Phủ đủ các nút lọc: "Tất cả", "5 Sao", "4 Sao", "Có hình ảnh · Video".
 * Nhiều comment (>5) để test phân trang (pageSize = 5).
 */

interface ReviewComment {
  avatar?: string;
  id?: number;
  name?: string;
  rating?: number;
  time?: string;
  content?: string;
  images?: string[];
}

const makeComment = (
  id: number,
  rating: number,
  withImages = false
): ReviewComment => ({
  id,
  avatar: LOCAL_AVATAR,
  name: `Người dùng ${id}`,
  rating,
  time: "2 ngày trước",
  content: `Nội dung đánh giá số ${id} với ${rating} sao.`,
  ...(withImages ? { images: [REVIEW_IMG_1, REVIEW_IMG_2] } : {}),
});

// 7 comment 5-sao (>5 → có 2 trang khi lọc 5 Sao), 2 comment 4-sao,
// trong đó vài comment có ảnh.
const comments: ReviewComment[] = [
  makeComment(1, 5, true),
  makeComment(2, 5, true),
  makeComment(3, 5),
  makeComment(4, 5),
  makeComment(5, 5),
  makeComment(6, 5),
  makeComment(7, 5),
  makeComment(8, 4, true),
  makeComment(9, 4),
];

export const mockReviews = {
  averageRating: 4.8,
  ratings: [
    { title: "Tất cả", id: 0, value: comments.length },
    { title: "5 Sao", id: 5, value: 7 },
    { title: "4 Sao", id: 4, value: 2 },
    { title: "Có hình ảnh · Video", id: 99, value: 3 },
  ],
  comments,
};
