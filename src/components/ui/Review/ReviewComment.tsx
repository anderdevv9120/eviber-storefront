import Image from "next/image";
import RatingStar from "../RatingStar";

export interface ReviewCommentProps {
  avatar?: string;
  id?: number;
  name?: string;
  rating?: number;
  time?: string;
  content?: string;
  images?: string[];
}

const ReviewComment = ({
  avatar,
  name,
  rating,
  time,
  content,
  images,
}: ReviewCommentProps) => {
  return (
    <div className="mt-2 border-b border-white-300">
      <div className="flex items-center gap-4 px-4">
        <Image
          src={avatar ?? "/images/avatar.png"}
          alt="User Img"
          width={300}
          height={300}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <p className="text-base mb-1">{name}</p>
          <RatingStar rating={rating} classStar="mx-0.5" />
          <p className="text-sm text-dark-300 mt-1">{time}</p>
        </div>
      </div>

      <div className="mt-2 mb-4 ml-16 px-4">
        <p className="font-normal mb-2">{content}</p>
        <div className="flex flex-wrap mb-2">
          {images?.map((imgUrl, idx) => (
            <Image
              key={idx}
              src={imgUrl}
              alt="category item"
              width={300}
              height={300}
              className="w-24 h-24 mr-4 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewComment;
