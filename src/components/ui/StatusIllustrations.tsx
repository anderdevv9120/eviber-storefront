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
