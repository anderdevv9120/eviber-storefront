import CollectionSkeleton from "./_component/CollectionSkeleton";

// Hiện ngay khi điều hướng client-side vào /collection (server đang fetch theo URL) —
// không có file này thì màn trước đứng im chờ SSR xong mới chuyển
const CollectionLoading = () => {
  return (
    <div className="container-base">
      <div className="pt-8 pb-10">
        <p className="text-2xl md:text-3xl font-bold mb-6">Tất cả sản phẩm</p>
        <CollectionSkeleton />
      </div>
    </div>
  );
};

export default CollectionLoading;
