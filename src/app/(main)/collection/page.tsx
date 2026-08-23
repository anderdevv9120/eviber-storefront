import { cardItems } from "@/mocks/fetchData";
import CollectionSort from "./_component/CollectionSort";
import CollectionSidebar from "./_component/CollectionSidebar";
import CollectionProducts from "./_component/CollectionProducts";
import EmptyCollection from "./_component/EmptyCollection";

const Collection = () => {
  return (
    <div className="container-base pt-10 pb-7">
      {/* <h1 className="text-center text-2xl font-medium xl:text-primary my-10 cursor-pointer hover:underline">
        Collection
      </h1> */}

      <CollectionSort />

      <div className="flex gap-14">
        <CollectionSidebar />

        {cardItems.length ? <CollectionProducts /> : <EmptyCollection />}
      </div>
    </div>
  );
};

export default Collection;

export const metadata = {
  title: "Bộ sưu tập",
  description: "Khám phá và tìm sản phẩm phù hợp với phong cách của bạn.",
};
