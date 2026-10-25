export default function ComboLoading() {
  return (
    <div className="container-base container-narrow" aria-hidden>
      <div className="grid gap-8 lg:grid-cols-2 xl:gap-12 mt-6 md:mt-10">
        <div className="space-y-3">
          <div className="aspect-square rounded-xl bg-white-200 animate-pulse" />
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
          <div className="h-7 w-1/3 rounded bg-white-300 animate-pulse" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-xl bg-white-200 animate-pulse"
            />
          ))}
          <div className="h-10 w-40 rounded-full bg-white-200 animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-12 flex-1 rounded-xl bg-white-200 animate-pulse" />
            <div className="h-12 flex-1 rounded-xl bg-white-300 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="pb-12 md:pb-16" />
    </div>
  );
}
