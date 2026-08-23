import Image from "next/image";
import Link from "next/link";
import { fetchCategoriesCached } from "@/apis/home.server";
import { ICategoryItem } from "@/@types/Home.type";
import { PATH } from "@/constants/paths";

export default async function Category() {
  const categories = await fetchCategoriesCached();

  // Rỗng/lỗi → ẩn hẳn section (chốt GĐ2, đồng nhất các section khác của home)
  if (categories.length === 0) return null;

  return (
    <div className="my-16 md:my-24">
      <h2 className="text-2xl md:text-3xl text-primary-800 text-center uppercase font-bold tracking-wide">
        Danh mục nổi bật
      </h2>
      <p className="text-center text-sm text-dark-400 mt-1 mb-8">
        Xem những sản phẩm đang thịnh hành ngay bây giờ
      </p>

      {/* 6 cột chỉ từ lg — ở md 6 vòng 112px + gap tràn khỏi 768px */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 justify-center">
        {categories.map((item: ICategoryItem) => (
          <CategoryItem
            key={item._id}
            _id={item._id}
            name={item.name}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}

const CategoryItem = ({ name, imageUrl }: ICategoryItem) => {
  return (
    <Link href={PATH.COLLECTION} className="group block">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-white ring-2 ring-primary-200 ring-offset-4 shadow-sm group-hover:ring-primary group-hover:shadow-md transition-all duration-300">
          <Image
            src={imageUrl || ""}
            alt={name}
            width={128}
            height={128}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <p className="mt-4 text-base font-semibold text-dark-800 group-hover:text-primary-700 transition-colors duration-300">
          {name}
        </p>
      </div>
    </Link>
  );
};
