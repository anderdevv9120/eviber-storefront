import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { PATH } from "@/constants/paths";

const Vouncher = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center gap-6 w-full py-10 px-4">
      <div className="text-center">
        <p className="text-lg md:text-2xl font-semibold text-gray-700">
          Chưa có voucher
        </p>
        <p className="text-gray-500 mt-2">Hiện tại bạn chưa có voucher nào.</p>
      </div>

      <Image
        src="/images/emptyProfile.png"
        quality={100}
        width={300}
        height={300}
        alt="No items found"
        className="object-contain w-64 h-64"
      />

      <Link href={PATH.MY_ACCOUNT}>
        <Button className="mt-6 px-6 py-2 text-sm font-medium text-white rounded-lg shadow-lg">
          Trở về trang chủ
        </Button>
      </Link>
    </div>
  );
};

export default Vouncher;
