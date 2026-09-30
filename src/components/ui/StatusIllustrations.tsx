// Minh họa cho StatusScreen — line art cùng bộ stroke với sprite icon
// (chốt tại tasks/phase5/audit/: X1 cho lỗi runtime, I4 cho 404)

/** Đám mây gạch chéo trong vòng tròn Pine — mất kết nối máy chủ */
export function CloudOfflineIllustration() {
  return (
    <div
      className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-50"
      aria-hidden
    >
      <svg
        className="h-[60px] w-[60px] text-primary-300"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 44h24a9 9 0 0 0 1-18 12 12 0 0 0-23 4 7 7 0 0 0-2 14Z" />
        <path d="M14 50 50 14" className="text-primary" stroke="currentColor" />
      </svg>
    </div>
  );
}

/** Thẻ tag mang dấu hỏi — mã đơn không khớp đơn nào */
export function OrderNotFoundIllustration() {
  return (
    <div
      className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 md:h-32 md:w-32"
      aria-hidden
    >
      <svg
        className="h-[46px] w-[46px] text-primary-300 md:h-[60px] md:w-[60px]"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 12h24l20 20-22 22L10 34V12Z" />
        <circle cx="19" cy="21" r="3" />
        <path
          className="text-primary"
          d="M28 30a5.5 5.5 0 1 1 7.5 5.1c-1.8.8-2.3 2-2.3 3.9M33.2 44v.6"
        />
      </svg>
    </div>
  );
}

/** Số 404 viền Pine, số 0 tô đặc — chính con số là nhãn, màn 404 không cần nhãn chữ riêng */
export function NotFoundIllustration() {
  return (
    <div
      className="select-none text-[96px] font-extrabold leading-none tracking-tighter text-transparent [-webkit-text-stroke:2px_theme(colors.primary.200)] md:text-[120px]"
      aria-hidden
    >
      4<span className="text-primary [-webkit-text-stroke:0]">0</span>4
    </div>
  );
}
