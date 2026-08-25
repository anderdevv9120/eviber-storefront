import { COLLECTION_GRID_CLASS, PAGE_SIZE } from "./collection.const";

const CollectionSkeleton = ({ count = PAGE_SIZE }: { count?: number }) => {
  return (
    <div className={COLLECTION_GRID_CLASS} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white-300 overflow-hidden"
        >
          <div className="aspect-[3/4] bg-white-200 animate-pulse" />
          <div className="px-3.5 pt-3 pb-4 space-y-2">
            <div className="h-4 rounded bg-white-200 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-white-200 animate-pulse" />
            <div className="h-5 w-1/3 rounded bg-white-300 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionSkeleton;
