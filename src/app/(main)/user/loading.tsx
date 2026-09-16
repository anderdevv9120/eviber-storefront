// Render trong khung /user (sidebar giữ nguyên) khi chuyển giữa các trang tài khoản
const UserLoading = () => {
  return (
    <div aria-hidden>
      <div className="h-8 w-56 rounded bg-white-200 animate-pulse mb-6 md:h-9" />
      <div className="flex flex-col gap-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-white-300 p-6 space-y-4"
          >
            <div className="h-5 w-40 rounded bg-white-200 animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-11 rounded-lg bg-white-200 animate-pulse" />
              <div className="h-11 rounded-lg bg-white-200 animate-pulse" />
              <div className="h-11 rounded-lg bg-white-200 animate-pulse" />
              <div className="h-11 rounded-lg bg-white-200 animate-pulse" />
            </div>
            <div className="h-10 w-32 rounded-md bg-white-300 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserLoading;
