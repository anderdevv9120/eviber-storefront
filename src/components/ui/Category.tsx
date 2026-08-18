import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/apis/home";

interface ICategoryItem {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
}

export default async function Category() {
  let categories: ICategoryItem[] = [];
  try {
    const response = await getCategory();
    categories = response?.data?.data || [];
  } catch {
    categories = [];
  }

  return (
    <div className="my-24">
      <h2 className="text-2xl md:text-4xl text-primary-800 text-center uppercase font-semibold tracking-wide">
        Sản phẩm nổi bật
      </h2>
      {categories.length > 0 ? (
        <>
          <p className="text-center mt-2 font-thin mb-8">
            Xem những sản phẩm đang thịnh hành ngay bây giờ
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-center">
            {categories.map((item: ICategoryItem) => (
              <CategoryItem
                key={item._id}
                _id={item._id}
                name={item.name}
                imageUrl={item.imageUrl}
              />
            ))}
          </div>
        </>
      ) : (
        <Image
          width={200}
          height={200}
          src="/images/empty-box.png"
          alt="No categories found"
          className="mx-auto mt-8"
        />
      )}
    </div>
  );
}

const CategoryItem = ({ name, imageUrl }: ICategoryItem) => {
  return (
    <Link href="#" className="group block">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-transparent bg-gradient-to-tr from-primary-400 to-primary-700 p-1 shadow-md group-hover:shadow-lg transition-all duration-300">
          <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
            <Image
              src={imageUrl || ""}
              alt={name}
              width={128}
              height={128}
              priority
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>

        <p className="mt-4 text-sm md:text-lg font-medium text-gray-800 group-hover:text-primary-500 transition-colors duration-300">
          {name}
        </p>
      </div>
    </Link>
  );
};
