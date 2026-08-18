import { Messenger, Twitter, Facebook, Heart } from "@/components/icons";

type ProductContactSocialProps = {
  totalFavorite: number;
};

const ProductContactSocial = ({ totalFavorite }: ProductContactSocialProps) => {
  return (
    <div className="mt-8 text-sm">
      <p className="mb-3">
        Gọi đặt mua{" "}
        <a
          className="text-blue-400 text-base hover:underline"
          href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
        >
          {process.env.NEXT_PUBLIC_PHONE_NUMBER}
        </a>{" "}
        (8h-22h)
      </p>

      <div className="flex items-center">
        <p className="mr-2">Chia sẻ</p>
        <Messenger />
        <Twitter className="w-7 h-7 mx-1" />
        <Facebook className="w-6 h-6" />
        <p className="flex items-center ml-4">
          <Heart className="text-white w-6 h-6 mr-2" />
          Đã thích ({totalFavorite})
        </p>
      </div>
    </div>
  );
};

export default ProductContactSocial;
