import RatingStar from "@/components/ui/RatingStar";

type ProductHeaderProps = {
  title: string;
  rating: number;
  numberReview: number;
  totalSold: number;
  status: string;
};

const ProductHeader = ({
  title,
  rating,
  numberReview,
  totalSold,
  status,
}: ProductHeaderProps) => {
  return (
    <>
      <h1 className="text-xl mb-2">{title}</h1>
      <div className="flex items-center mb-2 md:mb-6">
        <div className="flex items-center">
          <p className="mr-2">{rating}</p>
          <div className="flex items-center">
            <RatingStar rating={rating} classStar="mx-0.5" />
          </div>
        </div>

        <InfoSection label="Đánh giá" value={numberReview} />
        <InfoSection label="Đã bán" value={totalSold} />
        <InfoSection label="Tình trạng" value={status} isStatus={true} />
      </div>
    </>
  );
};

type InfoSectionProps = {
  label: string;
  value: string | number;
  isStatus?: boolean;
};

const InfoSection = ({ label, value, isStatus = false }: InfoSectionProps) => {
  return (
    <div className="flex ml-2 pl-2 text-xs border-l border-dark-50 lg:ml-4 lg:pl-4 sm:text-base">
      {isStatus ? (
        <>
          <p className="text-dark-300">{label}:</p>
          <span className="text-primary-800 ml-2">{value}</span>
        </>
      ) : (
        <>
          <span className="mr-2">{value}</span>
          <p className="text-dark-300">{label}</p>
        </>
      )}
    </div>
  );
};

export default ProductHeader;
