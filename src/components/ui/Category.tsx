import Image from "next/image";
import Link from "next/link";
import { fetchCategoriesCached } from "@/apis/home.server";
import { ICategoryItem } from "@/@types/Home.type";
import { PATH } from "@/constants/paths";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

export default async function Category() {
  const categories = await fetchCategoriesCached();

  // Rỗng/lỗi → ẩn hẳn section (chốt GĐ2, đồng nhất các section khác của home)
  if (categories.length === 0) return null;

  return (
    <div className="my-16 md:my-24">
      <div className="section-head mb-6">
        <h2 className="type-display-section font-display text-deep">
          Danh mục nổi bật
        </h2>
        <p className="type-section-sub text-dark-500">
          Xem những sản phẩm đang thịnh hành ngay bây giờ
        </p>
      </div>

      {/* 6 cột chỉ từ lg — ở md 6 vòng 112px + gap tràn khỏi 768px */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 justify-center">
        {categories.map((item: ICategoryItem) => (
          <CategoryItem
            key={item._id}
            _id={item._id}
            name={item.name}
            imageUrl={item.imageUrl}
            slug={item.slug}
          />
        ))}
      </div>
    </div>
  );
}

const CategoryItem = ({ name, imageUrl, slug }: ICategoryItem) => {
  return (
    // Thiếu slug → về collection trần (cùng quy ước sidebar collection: item không slug không filter được)
    <Link
      href={
        slug
          ? `${PATH.COLLECTION}?category=${encodeURIComponent(slug)}`
          : PATH.COLLECTION
      }
      className="group/cat block"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-white-100">
          <Image
            src={resolveImageUrl(imageUrl || "")}
            alt={name}
            width={128}
            height={128}
            className="w-full h-full object-cover transform group-hover/cat:scale-110 transition-transform duration-500"
          />
        </div>

        <p className="mt-4 text-base font-semibold text-dark-800 group-hover/cat:text-primary-700 transition-colors duration-300">
          {name}
        </p>
      </div>
    </Link>
  );
};
