// Skeleton bám khung grid 2 cột của PDP — hiện ngay khi client-nav vào sản phẩm chưa có
// trong ISR cache; thiếu file này màn trước đứng im chờ SSR xong mới chuyển
const ProductLoading = () => {
  return (
    <div className="container-base container-narrow" aria-hidden>
      <div className="grid gap-8 lg:grid-cols-2 xl:gap-12 mt-6 md:mt-10">
        <div className="space-y-3">
          <div className="aspect-[3/4] rounded-xl bg-white-200 animate-pulse" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-white-200 animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-white-200 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-white-200 animate-pulse" />
          <div className="h-7 w-1/4 rounded bg-white-300 animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-1/5 rounded bg-white-200 animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-16 rounded-lg bg-white-200 animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="h-10 w-40 rounded-full bg-white-200 animate-pulse mt-6" />
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="h-12 flex-1 rounded-xl bg-white-300 animate-pulse" />
            <div className="h-12 flex-1 rounded-xl bg-white-200 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="pb-12 md:pb-16" />
    </div>
  );
};

export default ProductLoading;
