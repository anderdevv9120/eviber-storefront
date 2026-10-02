import { notFound } from "next/navigation";

// Render thẳng PageNotFound ở đây là soft-404 (HTTP 200) — bot index màn báo lỗi
// như trang hợp lệ. notFound() trả status 404 thật, UI do (main)/not-found.tsx lo
// nên vẫn giữ Header/Footer.
export default function CatchAllNotFound() {
  notFound();
}
